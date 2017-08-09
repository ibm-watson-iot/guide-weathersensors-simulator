import { SET_IS_RUNNING, SET_ERROR, SET_PUBLISH_INTERVAL_DIVISOR } from '../constants/simulator';
import SimulatorService from '../services/simulator';


const setIsRunning = (isRunning) => ({
  type: SET_IS_RUNNING,
  isRunning,
});


const setError = (message) => ({
  type: SET_ERROR,
  message,
});

export const setPublishIntervalDivisor = (publishIntervalDivisor) => ({
  type: SET_PUBLISH_INTERVAL_DIVISOR,
  publishIntervalDivisor,
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

export const stopSimulator = () => (dispatch) => {
  SimulatorService.stop()
  .then(() => {
    dispatch(setIsRunning(false));
  })
  .catch((e) => {
    dispatch(setError(e.message));
  });
};

