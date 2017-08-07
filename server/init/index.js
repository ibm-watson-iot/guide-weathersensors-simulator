/* eslint global-require: "off"*/
'use strict';

const bodyParser = require('body-parser');
const compress = require('compression');
const path = require('path');
const serveStatic = require('serve-static');

const initMiddlewares = (app, baseDir) => {
  app.use(compress());
  app.use(bodyParser.json());
  app.use(serveStatic(path.join(baseDir, 'public'), { index: 'index.html' }));
};

const initRoutes = (app, io) => {
  const systemcheck = require('../routes/systemcheck');
  const simulator = require('../routes/simulator');

  app.use('/systemcheck', systemcheck());
  app.use('/simulator', simulator(io));

  // error handling
  const logger = require('../logger')('[error-handling]');
  app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    logger.error(err);
    res.status(500).send({ error: true, message: err.uiMessage || 'An error has occurred.' });
  });
};

const init = (app, dirname, io) => {
  initMiddlewares(app, dirname);
  initRoutes(app, io);
};

module.exports = init;
