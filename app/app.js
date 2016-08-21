'use strict';

const { app } = require('electron');
const { BrowserWindow } = require('electron');
const { Menu } = require('electron');
const { shell } = require('electron');
const { Tray } = require('electron');

const debug = require('debug')('hoodline-mini:app');
const path = require('path');
const settings = require('electron-settings');

const Feed = require('./feed');
const neighborhoods = require('./data/neighborhoods.json');
const notifier = require('./notifier');

class App {

  constructor() {

    /**
     * A reference to the Hoodline Mini About window.
     *
     * @type BrowserWindow
     * @default null
     * @private
     */
    this._aboutWindow = null;

    /**
     * A reference to the Hoodline Mini Tray instance.
     *
     * @type Tray
     * @default null
     * @private
     */
    this._tray = null;

    this._init();
  }

  /**
   * Initializes the Hoodline Mini app.
   *
   * @private
   */
  _init() {
    debug('initiailizing application...');

    this._initSettings();
    this._initStartup();
    this._initAppEvents();
    this._initTray();
    this._initFeed();

    debug('application initialized');
  }

  /**
   * Configure electron settings.
   *
   * @private
   */
  _initSettings() {
    const isDebugMode = process.env.NODE_ENV === 'development';

    settings.configure({
      prettify: isDebugMode
    });

    settings.defaults({
      subscriptions: []
    });

    if (isDebugMode) {
      settings.setSync('debugMode', true);
    }
  }

  /**
   * Run startup tasks.
   *
   * @private
   */
  _initStartup() {
    const version = app.getVersion();
    const now = new Date();

    settings.setSync('version', version);
    settings.setSync('lastOpened', now);

    if (!this._isDebugMode()) {
      app.dock.hide();
    }
  }

  /**
   * Initializes app event listeners.
   *
   * @private
   */
  _initAppEvents() {
    app.on('window-all-closed', () => {
      // Do not quit the application when any of the windows are closed.
      // The application persists independently of its windows.
      return false;
    });
  }

  /**
   * Initializes the Hoodline Mini Tray.
   *
   * @private
   */
  _initTray() {
    const tray = new Tray(App.TrayIcon);
    const appName = app.getName();
    const appVersion = app.getVersion();
    const _this = this;

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'About Hoodline Mini',
        click() {
          _this._showAboutWindow();
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Preferences…',
        click(menuItem) {
          neighborhoods.forEach(n => {
            shell.openExternal(n.feed);
          });
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Debug',
        type: 'submenu',
        visible: this._isDebugMode(),
        submenu: [
          {
            label: 'Open settings file…',
            click() {
              shell.openItem(settings.getSettingsFilePath());
            }
          },
          {
            label: 'Send test notification…',
            click() {
              notifier.notify({
                title: 'Test',
                body: 'This is a test notification.',
                link: 'https://github.com/nathanbuchar/hoodline-mini'
              });
            }
          }
        ]
      },
      {
        type: 'separator',
        visible: this._isDebugMode()
      },
      {
        label: 'Open at login',
        type: 'checkbox',
        checked: app.getLoginItemSettings().openAtLogin,
        click(menuItem) {
          app.setLoginItemSettings({
            openAtLogin: menuItem.checked
          });
        }
      },
      {
        label: 'Quit',
        click() {
          app.quit();
        }
      }
    ]);

    tray.setToolTip(`${appName} (v${appVersion})`);
    tray.setContextMenu(contextMenu);

    this._tray = tray;
  }

  /**
   * Fetches most recent neighborhood data from the server.
   *
   * @private
   */
  _initFeed() {
    const feed = new Feed();

    this._feed = feed;
  }

  /**
   * Shows the Hoodline Mini "About" window.
   *
   * @private
   */
  _showAboutWindow() {
    if (this._aboutWindow) {
      return;
    }

    this._aboutWindow = new BrowserWindow({
      show: false
    });

    this._aboutWindow.webContents.once('did-finish-load', () => {
      this._aboutWindow.show();
    });

    this._aboutWindow.loadURL(`file://${__dirname}/windows/about.html`);
  }

  /**
   * Whether the application is currently in debug mode.
   *
   * @returns {boolean}
   * @private
   */
  _isDebugMode() {
    return settings.getSync('debugMode') === true;
  }
}

/**
 * The path to the tray icon template.
 *
 * @type {string}
 * @static
 */
App.TrayIcon = path.join(__dirname, 'resources', 'IconTemplate.png');

/**
 * Creates the main App instance.
 *
 * @type {App}
 * @static
 */
App.instance = new App();
