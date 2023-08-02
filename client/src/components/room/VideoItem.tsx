import './index.css';

import { FC } from 'react';

import { LOCAL_VIDEO } from '@/hooks/useWebRTC';

interface IProps {
  clientID: string;
  provideMediaRef: (id: string, node: HTMLVideoElement) => void;
}

const VideoItem: FC<IProps> = ({ clientID, provideMediaRef }) => {
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
};

export default VideoItem;
