/* eslint global-require: "off"*/
'use strict';

const express = require('express');

module.exports = (io, middlewares) => {
  const router = express.Router(); // eslint-disable-line new-cap
  const simulator = require('../../tools/simulator')(io);

  if (middlewares) {
    middlewares.forEach(middleware => router.use(middleware));
  }

  router.get('/status', (req, res) => res.send({ isRunning: simulator.isRunning() }));

  router.get('/wiotpinfo', (req, res) => res.send({ wiotpInfo: simulator.getWIoTPInfo() }));

  router.post('/run', (req, res) => {
    // Return from the POST command regardless of the primise result
    // because the logs will be sent to the UI via socket
    simulator.run(req).catch(e => e);
    res.send({});
  });

  router.post('/stop', (req, res) => {
    simulator.stop()
      .then((result) => res.send({ result }))
      .catch(e => res.status(500).send({ error: true, message: e.message }));
  });

  return router;
};
