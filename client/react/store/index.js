import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createSocketIoMiddleware from 'redux-socket.io';
import io from 'socket.io-client';
import { BASE_URL } from '../constants/route';

const socket = io(BASE_URL);
const socketIoMiddleware = createSocketIoMiddleware(socket, 'server/');

import reducers from '../reducers';

export default createStore(
  reducers,
  compose(
    applyMiddleware(thunkMiddleware, socketIoMiddleware),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )
);
