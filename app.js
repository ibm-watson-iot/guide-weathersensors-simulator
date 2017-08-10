'use strict';

// Comment out the line below if you don't want to track deployment of this application
require('cf-deployment-tracker-client').track();

const app = require('express')();
require('./server')(__dirname)(app);
