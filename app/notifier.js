'use strict';

const { BrowserWindow } = require('electron');

const path = require('path');

const Notifier = {

  /**
   * Creates a new notification.
   *
   * @param {Object} options
   * @param {string} title
   * @param {string} body
   * @param {string} link
   */
  notify(options) {
    if (!Notifier.Window) {
      Notifier.Window = new BrowserWindow({
        focusable: false,
        show: false
      });

      Notifier.Window.webContents.once('did-finish-load', () => {
        this.notify.call(this, options);
      });

      Notifier.Window.loadURL(Notifier.PathToWindow);
    } else {
      Notifier.Window.webContents.send('notify', options);
    }
  }
};

/**
 * The Browser Window instance.
 *
 * @type BrowserWindow
 * @default null
 * @static
 */
Notifier.Window = null;

/**
 * The path to the notification window.
 *
 * @type string
 * @readonly
 */
Notifier.PathToWindow = `file://${__dirname}/windows/notification.html`;

module.exports = Notifier;
