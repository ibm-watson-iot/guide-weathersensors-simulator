/* eslint global-require: "off"*/
'use strict';

const logger = require('./logger')('server');
const nconf = require('nconf');
const path = require('path');
const io = require('socket.io');

const configServer = require('./init');

const initConfig = (app, baseDir) => {
  nconf.env().argv();
  if (app.get('env') === 'development') {
    nconf.file(app.get('env'), path.join(baseDir, 'config', 'app-development.json'));
  }
  nconf.file(path.join(baseDir, 'config', 'app.json'));
};

const startApp = (app) => {
  const port = process.env.VCAP_APP_PORT || process.env.PORT || nconf.get('port');
  return app.listen(port, () => {
    logger.info(`Express server listening on port ${port}`);
  });
};

const init = (dirname) => (app) => {
  initConfig(app, dirname);
  const server = startApp(app);
  configServer(app, dirname, io(server));
};

module.exports = init;
