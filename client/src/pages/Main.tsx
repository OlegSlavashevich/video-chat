import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ACTIONS } from 'shared';
import { v4 } from 'uuid';

import socket from '../socket';

export default function Main() {
  const navigate = useNavigate();
  const [rooms, updateRooms] = useState([]);
  const rootNode = useRef<HTMLInputElement>(null);

  useEffect(() => {
    socket.on(ACTIONS.SHARE_ROOMS, ({ rooms = [] } = {}) => {
      if (rootNode.current) {
        updateRooms(rooms);
      }
    });
  }, []);

  return (
    <div ref={rootNode}>
      <h1>Available Rooms</h1>

      <ul>
        {rooms.map((roomID) => (
          <li key={roomID}>
            {roomID}
            <button
              onClick={() => {
                navigate(`/room/${roomID}`);
              }}
            >
              JOIN ROOM
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={() => {
          navigate(`/room/${v4()}`);
        }}
      >
        Create New Room
      </button>
    </div>
  );
}
