'use strict';

const { EventEmitter } = require('events');

class Module extends EventEmitter {

  constructor() {
    super();
  }

  /**
   * @alias removeListener
   */
  off() {
    this.removeListener.call(this, arguments);
  }
}

export default Module;
