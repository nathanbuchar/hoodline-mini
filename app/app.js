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
const Notifier = require('./notifier');

/**
 * Whether the application is in debug mode.
 *
 * @type string
 */
const IS_DEBUG_MODE = process.env.NODE_ENV === 'development';

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

    /**
     * Called when new stories are found.
     *
     * @type Function
     * @private
     */
    this._handleNewStories = this._onNewStories.bind(this);

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
    this._initNotifier();
    this._initFeed();
    this._initTray();

    debug('application initialized');
  }

  /**
   * Configure electron settings.
   *
   * @private
   */
  _initSettings() {

    // Global settings configuration.
    settings.configure({
      prettify: IS_DEBUG_MODE
    });

    // Define default settings.
    settings.defaults({
      isSubscribedToAll: true,
      subscriptions: ['all']
    });

    // Ensure defaults exist.
    settings.applyDefaultsSync();
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

    if (!IS_DEBUG_MODE) {
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
   * Initializes the Notifier instance.
   *
   * @private
   */
  _initNotifier() {
    const notifier = new Notifier();

    this._notifier = notifier;
  }

  /**
   * Fetches most recent neighborhood data from the server.
   *
   * @private
   */
  _initFeed() {
    const feed = new Feed();

    feed.on('new-stories', this._handleNewStories);

    this._feed = feed;
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

    const contextMenu = Menu.buildFromTemplate([].concat(
      [
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
              _this._showPreferencesWindow();
            });
          }
        },
        {
          type: 'separator'
        }
      ],
      IS_DEBUG_MODE ? [
        {
          label: 'Debug',
          type: 'submenu',
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
                _this._notifier.notify({
                  title: 'Test',
                  body: 'This is a test notification.',
                  link: 'https://github.com/nathanbuchar/hoodline-mini'
                });
              }
            },
            {
              label: 'Check for new stories…',
              click() {
                _this._feed.checkForNewStories();
              }
            }
          ]
        },
        {
          type: 'separator'
        }
      ] : [],
      [
        {
          label: 'Open At Login',
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
      ]
    ));

    tray.setToolTip(`${appName} (v${appVersion})`);
    tray.setContextMenu(contextMenu);

    this._tray = tray;
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
      show: false,
      resizable: IS_DEBUG_MODE,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      width: 300,
      height: 500
    });

    this._aboutWindow.webContents.once('did-finish-load', () => {
      this._aboutWindow.show();
    });

    this._aboutWindow.on('close', () => {
      this._aboutWindow = null;
    });

    this._aboutWindow.loadURL(`file://${__dirname}/windows/about.html`);
  }

  /**
   * Shows the Hoodline Mini "Preferences" window.
   *
   * @private
   */
  _showPreferencesWindow() {
    if (this._preferencesWindow) {
      return;
    }

    this._preferencesWindow = new BrowserWindow({
      show: false,
      resizable: IS_DEBUG_MODE,
      maximizable: false,
      fullscreenable: false,
      width: 760,
      height: 550
    });

    this._preferencesWindow.webContents.once('did-finish-load', () => {
      this._preferencesWindow.show();
    });

    this._preferencesWindow.on('close', () => {
      this._preferencesWindow = null;
    });

    this._preferencesWindow.loadURL(`file://${__dirname}/windows/preferences.html`);
  }

  /**
   * Sends notifications for new stories.
   *
   * @param {Array} stories
   * @private
   */
  _onNewStories(stories) {
    stories.forEach((story, i) => {
      setTimeout(() => {
        this._notifier.notify(story);
      }, i * 6000);
    });
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
