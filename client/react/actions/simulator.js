import { SET_IS_RUNNING, SET_WIOTP_INFO, SET_CLOUDANT_INFO, SET_APP_INFO, SET_ERROR, SET_PUBLISH_INTERVAL_DIVISOR,
  SET_TEST_ENV, SET_DOMAIN } from '../constants/simulator';
import SimulatorService from '../services/simulator';


const setIsRunning = (isRunning) => ({
  type: SET_IS_RUNNING,
  isRunning,
});

const setWIoTPInfo = (wiotpInfo) => ({
  type: SET_WIOTP_INFO,
  wiotpInfo,
});

const setCloudantInfo = (cloudantInfo) => ({
  type: SET_CLOUDANT_INFO,
  cloudantInfo,
});

const setAppInfo = (appInfo) => ({
  type: SET_APP_INFO,
  appInfo,
});

const setError = (message) => ({
  type: SET_ERROR,
  message,
});

export const setPublishIntervalDivisor = (publishIntervalDivisor) => ({
  type: SET_PUBLISH_INTERVAL_DIVISOR,
  publishIntervalDivisor,
});

export const setTestEnv = (testEnv) => ({
  type: SET_TEST_ENV,
  testEnv,
});

export const setDomain = (domain) => ({
  type: SET_DOMAIN,
  domain,
});

export const clearError = () => (dispatch) => dispatch(setError(''));

export const runSimulator = (config) => (dispatch) => {
  dispatch(setIsRunning(true));
  SimulatorService.run(config)
  .then((response) => {
    if (response.error) {
      dispatch(setError(response.message));
      dispatch(setIsRunning(false));
    }
  })
  .catch((e) => {
    dispatch(setIsRunning(false));
    dispatch(setError(e.message));
  });
};

export const updateSimulatorStatus = () => (dispatch) => {
  SimulatorService.isRunning()
  .then((response) => {
    dispatch(setIsRunning(response.isRunning));
  })
  .catch((e) => {
    dispatch(setError(e.message));
  });
};

export const updateWIoTPInfo = () => (dispatch) => {
  SimulatorService.getWIoTPInfo()
  .then((response) => {
    dispatch(setWIoTPInfo(response.wiotpInfo));
  })
  .catch((e) => {
    dispatch(setError(e.message));
  });
};

export const updateCloudantInfo = () => (dispatch) => {
  SimulatorService.getCloudantInfo()
  .then((response) => {
    dispatch(setCloudantInfo(response.cloudantInfo));
  })
  .catch((e) => {
    dispatch(setError(e.message));
  });
};

export const updateAppInfo = () => (dispatch) => {
  SimulatorService.getAppInfo()
  .then((response) => {
    dispatch(setAppInfo(response.appInfo));
  })
  .catch((e) => {
    dispatch(setError(e.message));
  });
};

export const stopSimulator = () => (dispatch) => {
  SimulatorService.stop()
  .then(() => {
    dispatch(setIsRunning(false));
  })
  .catch((e) => {
    dispatch(setError(e.message));
  });
};

