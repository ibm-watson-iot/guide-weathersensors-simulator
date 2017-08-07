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

  router.post('/run', (req, res) => {
    simulator.run(req)
      .then((result) => res.send({ result }))
      .catch((e) => res.status(500).send({ error: true, message: e.message }));
  });

  router.post('/stop', (req, res) => {
    simulator.stop()
      .then((result) => res.send({ result }))
      .catch((e) => res.status(500).send({ error: true, message: e.message }));
  });

  return router;
};
