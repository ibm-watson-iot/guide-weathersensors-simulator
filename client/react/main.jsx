import 'babel-polyfill';
import React from 'react';
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import store from './store';

import Dashboard from './containers/Dashboard';


render(
  <Provider store={store}>
    <Dashboard />
  </Provider>,
  document.getElementById('root')
);
