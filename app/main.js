/**
 *
 *
 * @copyright 2016, Nathan Buchar <hello@nathanbuchar.com>
 */

'use strict';

const { app } = require('electron');
const { Menu } = require('electron');
const { Tray } = require('electron');

const path = require('path');
const settings = require('electron-settings');

let tray;

/**
 * Builds the menu bar tray and applies the context menu.
 */
function buildTray() {
  tray = new Tray(path.join(__dirname, 'resources', 'IconTemplate.png'));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'It works!',
      enabled: false
    }
  ]);

  tray.setToolTip(`Hoodline Mini (v${app.getVersion()})`);
  tray.setContextMenu(contextMenu);
}

/**
 * Called when Electron has finished initialization and is ready to create
 * browser windows and use other various APIs.
 */
app.on('ready', () => {
  app.dock.hide();

  const now = new Date();
  const version = app.getVersion();

  settings.setSync('lastOpened', now);
  settings.setSync('version', version);
  settings.setSync('opened', true);

  buildTray();
});
