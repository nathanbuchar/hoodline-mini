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

// 'use strict';
//
// const { BrowserWindow } = require('electron');
//
// const path = require('path');
//
// class Notification {
//
//   /**
//    * Creates a new notification.
//    *
//    * @param {string} title
//    * @param {string} body
//    * @param {string} link
//    */
//   constructor(title, body, link) {
//
//     /**
//      * The notification title.
//      *
//      * @type string
//      * @private
//      */
//     this._title = title;
//
//     /**
//      * The notification body.
//      *
//      * @type string
//      * @private
//      */
//     this._body = body;
//
//     /**
//      * The notification link.
//      *
//      * @type string
//      * @private
//      */
//     this._link = link;
//
//     /**
//      * The BrowserWindow instance.
//      *
//      * @type BrowserWindow
//      * @default null
//      * @private
//      */
//     this._window = null;
//
//     this._init();
//   }
//
//   /**
//    * Initializes the notification instance.
//    *
//    * @private
//    */
//   _init() {
//     this._initBrowserWindow().then(() => {
//       this._notify();
//     });
//   }
//
//   /**
//    * Creates the BrowserWindow for this notification.
//    *
//    * @returns {Promise}
//    * @private
//    */
//   _initBrowserWindow(fn) {
//     return new Promise((resolve, reject) => {
//       this._window = new BrowserWindow({
//         focusable: false,
//         show: false
//       });
//
//       this._window.loadURL(Notification.PathToWindow);
//       this._window.webContents.once('did-finish-load', () => {
//         resolve();
//       });
//     });
//   }
//
//   /**
//    * Triggers the notification.
//    *
//    * @private
//    */
  // _notify() {
  //   // this._window.webContents.send('notify', {
  //   //   title: this._title,
  //   //   body: this._body,
  //   //   link: this._link
  //   // });
  //   this._window.webContents.executeJavascript(`
  //     const { ipcRenderer } = require('electron');
  //     const { shell } = require('electron');
  //
  //     const notification = new Notification(${this._title}, {
  //       body: ${this._body},
  //       silent: true
  //     });
  //
  //     notification.onclick = evt => {
  //       shell.openExternal(${this._link});
  //     };
  //   `);
  // }
// };
//
// /**
//  * The path to the notification window.
//  *
//  * @type string
//  * @readonly
//  */
// Notification.PathToWindow = `file://${__dirname}/windows/notification.html`;
//
// module.exports = Notification;
