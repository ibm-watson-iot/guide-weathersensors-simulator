import { SET_IS_RUNNING, SET_SUCCESS, SET_ERROR, SET_PUBLISH_INTERVAL_DIVISOR, DEFAULT_PUBLISH_INTERVAL_DIVISOR } from '../constants/simulator';

const initialState = {
  isRunning: false,
  success: '',
  error: '',
  publishIntervalDivisor: DEFAULT_PUBLISH_INTERVAL_DIVISOR,
};

export const simulator = (state = initialState, action) => {
  switch (action.type) {

    case SET_IS_RUNNING:
      return Object.assign({}, state, { success: '', error: '', isRunning: action.isRunning });

    case SET_SUCCESS:
      return Object.assign({}, state, { success: action.message, error: '' });

    case SET_ERROR:
      return Object.assign({}, state, { success: '', error: action.message });

    case SET_PUBLISH_INTERVAL_DIVISOR:
      return Object.assign({}, state, { publishIntervalDivisor: action.publishIntervalDivisor });

    default:
      return state;

  }
};
