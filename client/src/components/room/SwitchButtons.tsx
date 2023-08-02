import './index.css';

import { FC, useState } from 'react';
import {
  BiMicrophone,
  BiMicrophoneOff,
  BiVideo,
  BiVideoOff
} from 'react-icons/bi';

interface IProps {
  switchAudioStream: () => void;
  switchVideoStream: () => void;
}

const SwitchButtons: FC<IProps> = ({
  switchAudioStream,
  switchVideoStream
}) => {
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

  const buttonSize = 28;

  return (
    <div className="buttons">
      <button
        onClick={handleButtonClick('audio')}
        className="mr-2 flex items-center justify-center  rounded-full border-[0.5px] p-4"
      >
        {audioOn ? (
          <BiMicrophone color="white" size={buttonSize} />
        ) : (
          <BiMicrophoneOff color="red" size={buttonSize} />
        )}
      </button>
      <button
        onClick={handleButtonClick('video')}
        className="ml-2 flex items-center justify-center  rounded-full border-[0.5px] p-4"
      >
        {videoOn ? (
          <BiVideo color="white" size={buttonSize} />
        ) : (
          <BiVideoOff color="red" size={buttonSize} />
        )}
      </button>
    </div>
  );
};

export default SwitchButtons;
