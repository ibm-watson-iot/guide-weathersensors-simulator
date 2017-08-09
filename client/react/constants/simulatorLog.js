// Constants
import { ERROR, SUCCESS, INFO, WARNING } from './notification';

export const MESSAGE = 'MESSAGE';
export const CLEAR_LOG = 'CLEAR_LOG';

export const RELEVANT_LOGS = [
  { prefix: '[SUCCESS]', type: SUCCESS },
  { prefix: '[ERROR]', type: ERROR },
  { prefix: '[INFO]', type: INFO },
  { prefix: '[WARNING]', type: WARNING },
];
