import './Room.css';

import { useEffect, useState } from 'react';
import {
  BiMicrophone,
  BiMicrophoneOff,
  BiVideo,
  BiVideoOff
} from 'react-icons/bi';
import { useParams } from 'react-router';

import useWebRTC, { LOCAL_VIDEO } from '../hooks/useWebRTC';

export default function Room() {
  const { id: roomID } = useParams();

  const { clients, provideMediaRef, switchAudioStream, switchVideoStream } =
    useWebRTC(roomID || '');

  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  const handleButtonClick = (type: 'audio' | 'video') => () => {
    if (type === 'audio') {
      switchAudioStream();
      setAudioOn(!audioOn);
    } else {
      switchVideoStream();
      setVideoOn(!videoOn);
    }
  };

  useEffect(() => {
    recalculateLayout();
  }, [clients]);

  function recalculateLayout() {
    const gallery = document.getElementById('gallery');
    const aspectRatio = 4 / 3;
    const screenWidth = document.body.getBoundingClientRect().width;
    const screenHeight = document.body.getBoundingClientRect().height;
    const videoCount = document.getElementsByTagName('video').length;

    // or use this nice lib: https://github.com/fzembow/rect-scaler
    function calculateLayout(
      containerWidth: number,
      containerHeight: number,
      videoCount: number,
      aspectRatio: number
    ): { width: number; height: number; cols: number } {
      let bestLayout = {
        area: 0,
        cols: 0,
        rows: 0,
        width: 0,
        height: 0
      };

      // brute-force search layout where video occupy the largest area of the container
      for (let cols = 1; cols <= videoCount; cols++) {
        const rows = Math.ceil(videoCount / cols);
        const hScale = containerWidth / (cols * aspectRatio);
        const vScale = containerHeight / rows;
        let width;
        let height;
        if (hScale <= vScale) {
          width = Math.floor(containerWidth / cols);
          height = Math.floor(width / aspectRatio);
        } else {
          height = Math.floor(containerHeight / rows);
          width = Math.floor(height * aspectRatio);
        }
        const area = width * height;
        if (area > bestLayout.area) {
          bestLayout = {
            area,
            width,
            height,
            rows,
            cols
          };
        }
      }
      return bestLayout;
    }

    const { width, height, cols } = calculateLayout(
      screenWidth,
      screenHeight,
      videoCount,
      aspectRatio
    );

    gallery?.style.setProperty('--width', width + 'px');
    gallery?.style.setProperty('--height', height + 'px');
    gallery?.style.setProperty('--cols', cols + '');
  }

  useEffect(() => {
    window.addEventListener('resize', recalculateLayout);

    return () => {
      window.removeEventListener('resize', recalculateLayout);
    };
  }, []);

  return (
    <div className="room">
      <div className="wrapper">
        <div id="gallery">
          {clients.map((clientID) => {
            return (
              <div className="video-container" key={clientID} id={clientID}>
                <video
                  style={{
                    width: '100%',
                    height: '100%'
                  }}
                  ref={(instance) => {
                    if (instance) {
                      provideMediaRef(clientID, instance);
                    }
                  }}
                  autoPlay
                  playsInline
                  muted={clientID === LOCAL_VIDEO}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="buttons">
        <button
          onClick={handleButtonClick('audio')}
          className="mr-2 flex items-center justify-center  rounded-full border-[0.5px] p-4"
        >
          {audioOn ? (
            <BiMicrophone color="white" size={28} />
          ) : (
            <BiMicrophoneOff color="red" size={28} />
          )}
        </button>
        <button
          onClick={handleButtonClick('video')}
          className="ml-2 flex items-center justify-center  rounded-full border-[0.5px] p-4"
        >
          {videoOn ? (
            <BiVideo color="white" size={28} className="" />
          ) : (
            <BiVideoOff color="red" size={28} className="" />
          )}
        </button>
      </div>
    </div>
  );
}
