import { MESSAGE, CLEAR_LOG, RELEVANT_LOGS } from '../constants/simulatorLog';

const initialState = {
  lastRelevantLog: {},
  completeLog: [],
};

export const simulatorLog = (state = initialState, action) => {
  let relevantLog;
  switch (action.type) {

    case CLEAR_LOG:
      return initialState;

    case MESSAGE:
      relevantLog = RELEVANT_LOGS.find(r => action.log && action.log.startsWith && action.log.startsWith(r.prefix));
      return Object.assign({}, state, {
        completeLog: [...state.completeLog, action.log],
        lastRelevantLog: relevantLog
          ? { message: action.log.split(relevantLog.prefix)[1], type: relevantLog.type }
          : state.lastRelevantLog,
      });

    default:
      return state;
  }
};
