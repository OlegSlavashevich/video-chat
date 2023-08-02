// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import freeice from 'freeice';
import { useCallback, useEffect, useRef } from 'react';
import { ACTIONS } from 'shared';

import socket from '../socket';
import useStateWithCallback from './useStateWithCallback';

export const LOCAL_VIDEO = 'LOCAL_VIDEO';

export default function useWebRTC(roomID: string) {
  const [clients, updateClients] = useStateWithCallback<string[]>([]);

  const addNewClient = useCallback(
    (newClient: string, cb: () => void) => {
      if (typeof updateClients === 'function') {
        updateClients((list: string[]) => {
          if (!list.includes(newClient)) {
            return [...list, newClient];
          }

          return list;
        }, cb);
      }
    },
    [updateClients]
  );

  const peerConnections = useRef<{
    [peerId: string]: RTCPeerConnection;
  }>({});

  const localMediaStream = useRef<MediaStream | null>(null);

  const peerMediaElements = useRef<{
    [peerId: string]: HTMLVideoElement | null;
  }>({
    [LOCAL_VIDEO]: null
  });

  useEffect(() => {
    async function handleNewPeer({
      peerID,
      createOffer
    }: {
      peerID: string;
      createOffer: () => unknown;
    }) {
      if (peerID in peerConnections.current) {
        return console.warn(`Already connected to peer ${peerID}`);
      }

      peerConnections.current[peerID] = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'turn:64.233.165.127:19305?transport=udp' }
        ]
      });

      peerConnections.current[peerID].onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit(ACTIONS.RELAY_ICE, {
            peerID,
            iceCandidate: event.candidate
          });
        }
      };

      let tracksNumber = 0;
      peerConnections.current[peerID].ontrack = ({
        streams: [remoteStream]
      }) => {
        tracksNumber++;

        if (tracksNumber === 2) {
          // video & audio tracks received
          tracksNumber = 0;
          addNewClient(peerID, () => {
            if (peerMediaElements.current[peerID]) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              peerMediaElements.current[peerID].srcObject = remoteStream;
            } else {
              // FIX LONG RENDER IN CASE OF MANY CLIENTS
              let settled = false;
              const interval = setInterval(() => {
                if (peerMediaElements.current[peerID]) {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  peerMediaElements.current[peerID].srcObject = remoteStream;
                  settled = true;
                }

                if (settled) {
                  clearInterval(interval);
                }
              }, 1000);
            }
          });
        }
      };

      if (localMediaStream.current) {
        localMediaStream.current?.getTracks().forEach((track) =>
          peerConnections.current[peerID].addTrack(
            track,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            localMediaStream.current
          )
        );
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (createOffer) {
        const offer = await peerConnections.current[peerID].createOffer();

        await peerConnections.current[peerID].setLocalDescription(offer);

        socket.emit(ACTIONS.RELAY_SDP, {
          peerID,
          sessionDescription: offer
        });
      }
    }

    socket.on(ACTIONS.ADD_PEER, handleNewPeer);

    return () => {
      socket.off(ACTIONS.ADD_PEER);
    };
  }, [addNewClient]);

  useEffect(() => {
    async function setRemoteMedia({
      peerID,
      sessionDescription: remoteDescription
    }: {
      peerID: string;
      sessionDescription: RTCSessionDescriptionInit;
    }) {
      await peerConnections.current[peerID]?.setRemoteDescription(
        new RTCSessionDescription(remoteDescription)
      );

      if (remoteDescription.type === 'offer') {
        const answer = await peerConnections.current[peerID].createAnswer();

        await peerConnections.current[peerID].setLocalDescription(answer);

        socket.emit(ACTIONS.RELAY_SDP, {
          peerID,
          sessionDescription: answer
        });
      }
    }

    socket.on(ACTIONS.SESSION_DESCRIPTION, setRemoteMedia);

    return () => {
      socket.off(ACTIONS.SESSION_DESCRIPTION);
    };
  }, []);

  useEffect(() => {
    socket.on(ACTIONS.ICE_CANDIDATE, ({ peerID, iceCandidate }) => {
      peerConnections.current[peerID]?.addIceCandidate(
        new RTCIceCandidate(iceCandidate)
      );
    });

    return () => {
      socket.off(ACTIONS.ICE_CANDIDATE);
    };
  }, []);

  useEffect(() => {
    const handleRemovePeer = ({ peerID }: { peerID: string }) => {
      if (peerConnections.current[peerID]) {
        peerConnections.current[peerID].close();
      }

      delete peerConnections.current[peerID];
      delete peerMediaElements.current[peerID];

      updateClients((list) => list.filter((c) => c !== peerID));
    };

    socket.on(ACTIONS.REMOVE_PEER, handleRemovePeer);

    return () => {
      socket.off(ACTIONS.REMOVE_PEER);
    };
  }, [updateClients]);

  useEffect(() => {
    async function startCapture() {
      const userMediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });

      if (!userMediaStream) return;

      localMediaStream.current = userMediaStream;

      addNewClient(LOCAL_VIDEO, () => {
        const localVideoElement = peerMediaElements.current[LOCAL_VIDEO];

        if (localVideoElement) {
          localVideoElement.volume = 0;
          localVideoElement.srcObject = localMediaStream.current;
        }
      });
    }

    startCapture()
      .then(() => socket.emit(ACTIONS.JOIN, { room: roomID }))
      .catch((e) => console.error('Error getting userMedia:', e));

    return () => {
      if (localMediaStream.current) {
        localMediaStream.current.getTracks().forEach((track) => track.stop());

        socket.emit(ACTIONS.LEAVE);
      }
    };
  }, [addNewClient, roomID]);

  const provideMediaRef = useCallback((id: string, node: HTMLVideoElement) => {
    peerMediaElements.current[id] = node;
  }, []);

  const switchVideoStream = () => {
    const videoTrack = localMediaStream?.current?.getVideoTracks()[0];

    if (!videoTrack) return;

    videoTrack.enabled = !videoTrack.enabled;
  };

  const switchAudioStream = () => {
    const videoTrack = localMediaStream?.current?.getAudioTracks()[0];

    if (!videoTrack) return;

    videoTrack.enabled = !videoTrack.enabled;
  };

  return {
    clients,
    provideMediaRef,
    switchVideoStream,
    switchAudioStream
  };
}
