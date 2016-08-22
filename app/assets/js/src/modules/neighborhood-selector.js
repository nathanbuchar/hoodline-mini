'use strict';

const { ipcRenderer } = require('electron');
const { shell } = require('electron');

const Base = require('../common/base');

class NeighborhoodSelector extends Base {

  /**
   * Creates a new module instance.
   */
  constructor() {
    super();

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
   * Initializes this module instance.
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
    const nodes = context.querySelectorAll(NeighborhoodSelector.Selectors.BASE);
    const instances = new Map();

    nodes.forEach(node => {
      if (!NeighborhoodSelector.Instances.has(node)) {
        const instance = new NeighborhoodSelector(node, options);

        NeighborhoodSelector.instances.set(node, instance);
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
NeighborhoodSelector.Instances = new Map();

/**
 * Module class names.
 *
 * @enum {string}
 * @readonly
 */
NeighborhoodSelector.ClassNames = {
  BASE: 'neighborhood-selector'
};

/**
 * Module selectors.
 *
 * @enum {string}
 * @readonly
 */
NeighborhoodSelector.Selectors = {
  BASE: `.${NeighborhoodSelector.ClassNames.BASE}`
};

/**
 * Initializes all module instances.
 */
NeighborhoodSelector.initializeAll();

module.exports = NeighborhoodSelector;
