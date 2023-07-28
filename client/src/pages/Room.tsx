import { useParams } from 'react-router';

import useWebRTC, { LOCAL_VIDEO } from '../hooks/useWebRTC';

export default function Room() {
  const { id: roomID } = useParams();
  const { clients, provideMediaRef } = useWebRTC(roomID || '');

  console.log(clients);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        height: '100vh'
      }}
    >
      <div className="grid grid-cols-2">
        {clients.map((clientID) => {
          return (
            <div key={clientID} id={clientID}>
              <video
                width="100%"
                height="100%"
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
  );
}
