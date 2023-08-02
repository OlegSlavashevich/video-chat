import './Room.css';

import { useParams } from 'react-router';

import SwitchButtons from '@/components/room/SwitchButtons';
import VideoList from '@/components/room/VideoList';

import useWebRTC from '../hooks/useWebRTC';

export default function Room() {
  const { id: roomID } = useParams();

  const { clients, provideMediaRef, switchAudioStream, switchVideoStream } =
    useWebRTC(roomID || '');

  return (
    <div className="room">
      <VideoList clients={clients} provideMediaRef={provideMediaRef} />
      <SwitchButtons
        switchAudioStream={switchAudioStream}
        switchVideoStream={switchVideoStream}
      />
    </div>
  );
}
