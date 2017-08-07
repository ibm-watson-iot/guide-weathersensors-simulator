import { MESSAGE, CLEAR_LOG } from '../constants/simulatorLog';

const initialState = {
  completeLog: [],
};

export const simulatorLog = (state = initialState, action) => {
  switch (action.type) {

    case CLEAR_LOG:
      return Object.assign({}, state, { completeLog: [] });

    case MESSAGE:
      return Object.assign({}, state, { completeLog: [...state.completeLog, action.log] });

    default:
      return state;

  }
};
