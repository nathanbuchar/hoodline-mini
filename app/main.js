'use strict';

const { app } = require('electron');
const dotenv = require('dotenv');

/**
 * Load in environment variables if they exist.
 */
dotenv.config({ silent: true });

/**
 * Called when Electron has finished initialization and is ready to create
 * browser windows and use other various APIs.
 */
app.on('ready', () => {
  require('./app');
});
