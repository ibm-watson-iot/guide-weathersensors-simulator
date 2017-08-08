import { SET_IS_RUNNING, SET_SUCCESS, SET_ERROR, SET_PUBLISH_INTERVAL_DIVISOR } from '../constants/simulator';
import SimulatorService from '../services/simulator';


const setIsRunning = (isRunning) => ({
  type: SET_IS_RUNNING,
  isRunning,
});

const setSuccess = (message) => ({
  type: SET_SUCCESS,
  message,
});

const setError = (message) => ({
  type: SET_ERROR,
  message,
});

export const setPublishIntervalDivisor = (publishIntervalDivisor) => ({
  type: SET_PUBLISH_INTERVAL_DIVISOR,
  publishIntervalDivisor,
});

export const clearSuccess = () => (dispatch) => dispatch(setSuccess(''));

export const clearError = () => (dispatch) => dispatch(setError(''));

export const runSimulator = (config) => (dispatch) => {
  dispatch(setIsRunning(true));
  SimulatorService.run(config)
  .then((response) => {
    dispatch(setIsRunning(false));
    if (response.error) {
      dispatch(setError(response.message));
    }
    else {
      dispatch(setSuccess(response.result && response.result.message));
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

export const stopSimulator = () => (dispatch) => {
  SimulatorService.stop()
  .then(() => {
    dispatch(setIsRunning(false));
  })
  .catch((e) => {
    dispatch(setError(e.message));
  });
};

