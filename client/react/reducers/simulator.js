import { SET_IS_RUNNING, SET_WIOTP_INFO, SET_ERROR, SET_PUBLISH_INTERVAL_DIVISOR,
  DEFAULT_PUBLISH_INTERVAL_DIVISOR, SET_TEST_ENV } from '../constants/simulator';

const initialState = {
  isRunning: false,
  wiotpInfo: undefined,
  testEnv: undefined,
  error: '',
  publishIntervalDivisor: DEFAULT_PUBLISH_INTERVAL_DIVISOR,
};

export const simulator = (state = initialState, action) => {
  switch (action.type) {

    case SET_IS_RUNNING:
      return Object.assign({}, state, { error: '', isRunning: action.isRunning });

    case SET_WIOTP_INFO:
      return Object.assign({}, state, { wiotpInfo: action.wiotpInfo });

    case SET_ERROR:
      return Object.assign({}, state, { error: action.message });

    case SET_PUBLISH_INTERVAL_DIVISOR:
      return Object.assign({}, state, { publishIntervalDivisor: action.publishIntervalDivisor });

    case SET_TEST_ENV:
      return Object.assign({}, state, { testEnv: action.testEnv });

    default:
      return state;

  }
};
