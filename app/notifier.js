'use strict';

const { BrowserWindow } = require('electron');

const path = require('path');

class Notifier {

  constructor() {

    /**
     * Reference to the notification window.
     *
     * @type BrowserWindow
     * @default null
     * @private
     */
    this._window = null;

    this._initWindow();
  }

  /**
   * Initializes the notification window.
   *
   * @private
   */
  _initWindow() {
    this._window = new BrowserWindow({
      focusable: false,
      show: false
    });

    this._window.loadURL(Notifier.PathToWindow);
  }

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
}

/**
 * The path to the notification window.
 *
 * @type string
 * @readonly
 */
Notifier.PathToWindow = `file://${__dirname}/windows/notification.html`;

module.exports = Notifier;
