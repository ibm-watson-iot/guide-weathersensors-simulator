'use strict';

const loggerUtil = require('log4js');

module.exports = (name) => loggerUtil.getLogger(`simulator-${name}`);
