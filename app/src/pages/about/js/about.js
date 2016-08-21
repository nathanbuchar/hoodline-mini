'use strict';

import { ipcRenderer } from 'electron';

import Base from '../../../common/base';

class AboutPage extends Base {

  constructor() {
    super();

    console.log('new about page!');
  }

  static initializeAll(context, options={}) {
    document.querySelectorAll(AboutPage.Selectors.BASE).forEach(element => {
      if (!AboutPage.Instances.has(element)) {
        const instance = new AboutPage(element, options);

        AboutPage.Instances.set(element, instance);
      }
    });
  }
}

/**
 * Module instances.
 *
 * @type Map
 * @readonly
 */
AboutPage.Instances = new Map();

/**
 * Module class names.
 *
 * @enum {string}
 * @readonly
 */
AboutPage.ClassNames = {
  BASE: 'about-page'
};

/**
 * Module class selectors.
 *
 * @enum {string}
 * @readonly
 */
AboutPage.Selectors = {
  BASE: `.${AboutPage.ClassNames.BASE}`
};

/**
 * Initialze all module instances.
 */
AboutPage.initializeAll();

export default AboutPage;
