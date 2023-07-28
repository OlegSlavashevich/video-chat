import { io } from 'socket.io-client';

const options = {
  'force new connection': true,
  reconnectionAttempts: 'Infinity', // avoid having user reconnect manually in order to prevent dead clients after a server restart
  timeout: 10000, // before connect_error and connect_timeout are emitted.
  transports: ['websocket']
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const socket = io(
  {
    path: '/websocket'
  },
  options
);

export default socket;
