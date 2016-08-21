'use strict';

const { EventEmitter } = require('events');

class Base extends EventEmitter {
  off() {
    this.removeListener.apply(this, arguments);
  }
}

module.exports = Base;
