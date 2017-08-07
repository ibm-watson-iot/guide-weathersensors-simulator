import { combineReducers } from 'redux';

import { simulator } from './simulator';
import { simulatorLog } from './simulatorLog';

const reducers = combineReducers({
  simulator,
  simulatorLog,
});

export default reducers;
