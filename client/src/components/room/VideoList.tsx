import './index.css';

import { debounce } from 'lodash';
import { FC, useEffect, useMemo } from 'react';

import { calculateLayout } from '@/utils/calculateVideoLayout';

import VideoItem from './VideoItem';

interface IProps {
  clients: string[];
  provideMediaRef: (id: string, node: HTMLVideoElement) => void;
}

const VideoList: FC<IProps> = ({ clients, provideMediaRef }) => {
  function recalculateLayout() {
    const gallery = document.getElementById('gallery');
    const aspectRatio = 4 / 3;
    const screenWidth = document.body.getBoundingClientRect().width;
    const screenHeight = document.body.getBoundingClientRect().height;
    const videoCount = document.getElementsByTagName('video').length;

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
    recalculateLayout();
  }, [clients]);

  const debouncedRecalculateLayout = useMemo(
    () => debounce(recalculateLayout, 50),
    []
  );

  useEffect(() => {
    window.addEventListener('resize', debouncedRecalculateLayout);

    return () => {
      window.removeEventListener('resize', debouncedRecalculateLayout);
    };
  }, [debouncedRecalculateLayout]);

  return (
    <div className="wrapper">
      <div id="gallery">
        {clients.map((clientID) => (
          <VideoItem
            key={clientID}
            clientID={clientID}
            provideMediaRef={provideMediaRef}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoList;
