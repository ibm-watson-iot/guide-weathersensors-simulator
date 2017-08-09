import { SET_IS_RUNNING, SET_ERROR, SET_PUBLISH_INTERVAL_DIVISOR, DEFAULT_PUBLISH_INTERVAL_DIVISOR } from '../constants/simulator';

const initialState = {
  isRunning: false,
  error: '',
  publishIntervalDivisor: DEFAULT_PUBLISH_INTERVAL_DIVISOR,
};

export const simulator = (state = initialState, action) => {
  switch (action.type) {

    case SET_IS_RUNNING:
      return Object.assign({}, state, { error: '', isRunning: action.isRunning });

    case SET_ERROR:
      return Object.assign({}, state, { error: action.message });

    case SET_PUBLISH_INTERVAL_DIVISOR:
      return Object.assign({}, state, { publishIntervalDivisor: action.publishIntervalDivisor });

    default:
      return state;

  }
};
