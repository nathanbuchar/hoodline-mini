'use strict';

const { ipcRenderer } = require('electron');
const { shell } = require('electron');

const Base = require('../common/base');

class NotificationWindow extends Base {

  /**
   * Creates a new module instance.
   */
  constructor() {
    super();

    /**
     * Called when the "notify" event is emitted via IPC.
     *
     * @type Function
     * @private
     */
    this._handleNotify = this._onNotify.bind(this);

    this._init();
  }

  /**
   * Initializes this module instance.
   *
   * @private
   */
  _init() {
    this._initEvents();
  }

  /**
   * Registers event listeners.
   *
   * @private
   */
  _initEvents() {
    ipcRenderer.on('notify', this._handleNotify);
  }

  /**
   * Called when the "notify" event is emitted via IPC.
   *
   * @param {Object} evt
   * @private
   */
  _onNotify(evt, { title, body, link }) {
    const notification = this._createNotification(title, body);

    // Handle notification click.
    notification.onclick = evt => {
      shell.openExternal(link);
    };
  }

  /**
   * Creates a new Notification.
   *
   * @param {string} title
   * @param {string} body
   * @returns {Notification} notification
   * @private
   */
  _createNotification(title, body) {
    const notification = new Notification(title, {
      body,
      sticky: true,
      silent: true
    });

    return notification;
  }

  /**
   * Initializes all modules within the given context.
   *
   * @param {Object} context
   * @param {Object} options
   * @returns {Map} instances
   * @static
   */
  static initializeAll(context=document, options={}) {
    const nodes = context.querySelectorAll(NotificationWindow.Selectors.BASE);
    const instances = new Map();

    nodes.forEach(node => {
      if (!NotificationWindow.Instances.has(node)) {
        const instance = new NotificationWindow(node, options);

        NotificationWindow.instances.set(node, instance);
        instances.set(node, instance);
      }
    });

    return instances;
  }
}

/**
 * Module instances map.
 *
 * @type Map
 * @readonly
 */
NotificationWindow.Instances = new Map();

/**
 * Module class names.
 *
 * @enum {string}
 * @readonly
 */
NotificationWindow.ClassNames = {
  BASE: 'notification-window'
};

/**
 * Module selectors.
 *
 * @enum {string}
 * @readonly
 */
NotificationWindow.Selectors = {
  BASE: `.${NotificationWindow.ClassNames.BASE}`
};

/**
 * Initializes all module instances.
 */
NotificationWindow.initializeAll();

module.exports = NotificationWindow;
