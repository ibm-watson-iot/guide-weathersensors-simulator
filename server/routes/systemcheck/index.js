const express = require('express');

const getStatus = (req, res, next) => res.send({ running: true }); // eslint-disable-line no-unused-vars

module.exports = (middlewares) => {
  const router = express.Router(); // eslint-disable-line new-cap

  if (middlewares) {
    middlewares.forEach(middleware => router.use(middleware));
  }

  router.get('/', getStatus);

  return router;
};
