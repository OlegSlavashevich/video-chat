import { createBrowserRouter } from 'react-router-dom';

import Main from './pages/Main';
import Room from './pages/Room';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Main />
  },
  {
    path: '/room/:id',
    element: <Room />
  }
]);
