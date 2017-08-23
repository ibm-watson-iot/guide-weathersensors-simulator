'use strict';

import { doGet, doPost } from './common';

const SimulatorService = {
  isRunning: () => doGet('/simulator/status'),
  getWIoTPInfo: () => doGet('/simulator/wiotpinfo'),
  run: (params) => doPost('/simulator/run', params),
  stop: () => doPost('/simulator/stop', {}),
};

export default SimulatorService;
