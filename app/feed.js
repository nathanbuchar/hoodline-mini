'use strict';

const { app } = require('electron');
const { EventEmitter } = require('events');
const debug = require('debug')('hoodline-mini:feed');
const got = require('got');
const settings = require('electron-settings');
const xml2js = require('xml2js');

const neighborhoods = require('./data/neighborhoods.json');
const Package = require('./package.json');

class Feed extends EventEmitter {

  constructor() {
    super();

    /**
     * The last time the feed was checked.
     *
     * @type string
     * @default null
     * @private
     */
    this._lastUpdatedTime = null;

    /**
     * The polling interval.
     *
     * @type Object
     * @default null
     * @private
     */
    this._pollInterval = null;

    /**
     * Called when the polling interval ticks.
     *
     * @type Function
     * @private
     */
    this._handlePoll = this._onPoll.bind(this);

    this._init();
  }

  /**
   * Initializes the Hoodline Mini feed.
   *
   * @private
   */
  _init() {
    this._initLastUpdatedTime();
    this._initPollingInterval();
  }

  /**
   * Initialize the last updated time.
   *
   * @private
   */
  _initLastUpdatedTime() {
    this._updateLastUpdatedTime();
  }

  /**
   * Initializes the polling interval.
   *
   * @param {boolean} immediate
   * @private
   */
  _initPollingInterval(immediate=false) {
    this._pollInterval = setInterval(this._handlePoll, Feed.PollingFrequency);

    if (immediate) {
      this._handlePoll();
    }
  }

  /**
   * Updates the last updated time to the current datetime.
   *
   * @private
   */
  _updateLastUpdatedTime() {
    this._lastUpdatedTime = new Date();
  }

  /**
   * Handles polling interval ticks.
   *
   * @private
   */
  _onPoll() {
    clearInterval(this._pollInterval);

    this._fetchNewStories().then(() => {
      this._initPollingInterval();
    });
  }

  /**
   * Fetches new and unique stories from all subscribed feeds.
   *
   * @param {boolean} [notify=true]
   * @private
   */
  _fetchNewStories(notify=true) {
    debug('fetching new stories...');

    return new Promise((resolve, reject) => {
      this._fetchStories().then(stories => {
        const uniqueStories = this._filterUniqueStories(stories);
        const newStories = this._filterNewArticles(uniqueStories);

        debug(`found ${newStories.length} new stories`);

        if (notify && newStories.length) {
          this.emit(Feed.Events.NEW_STORIES, newStories.map(story => {
            return {
              title: this._getTitleFromStory(story),
              body: this._getSummaryFromStory(story),
              link: this._getLinkFromStory(story)
            };
          }));
        }

        this._updateLastUpdatedTime();

        resolve();
      }).catch(err => {
        console.log(err);
        resolve();
      });
    });
  }

  /**
   * Fetches all stories from all subscribed feeds.
   *
   * @returns {Promise}
   * @private
   */
  _fetchStories() {
    return new Promise((resolve, reject) => {
      settings.get('subscriptions').then(subscriptions => {
        Promise.all(subscriptions.map(id => {
          return this._fetchStoriesFromNeighborhoodId(id);
        })).then(storySets => {
          const allStories = storySets.reduce((curr, prev) => {
            return prev.concat(curr);
          }, []);

          resolve(allStories);
        }, reject);
      });
    });
  }

  /**
   * Fetches all stories from a given neighborhood id.
   *
   * @param {string} id
   * @returns {Promise}
   * @private
   */
  _fetchStoriesFromNeighborhoodId(id) {
    const neighborhood = this._getNeighborhoodFromId(id);

    debug(`fetching stories from ${neighborhood.friendlyName}...`);

    return new Promise((resolve, reject) => {
      this._fetchStoreisFromFeed(neighborhood.feed).then(stories => {
        resolve(stories);
      }, reject);
    });
  }

  /**
   * Fetches atom data from a given feed URL.
   *
   * @param {string} feed
   * @returns {Promise}
   * @private
   */
  _fetchStoreisFromFeed(feed) {
    const { author, homepage } = Package;

    return new Promise((resolve, reject) => {
      got(feed, {
        headers: {
          'User-Agent':
            'Hoodline Mini v' + app.getVersion() + ' by ' + author + '. ' +
            'See ' + homepage + ' for more information.'
        }
      }).then(response => {
        if (response.statusCode === 200) {
          this._parseStoriesFromFeed(response.body).then(resolve, reject);
        } else {
          reject();
        }
      }, reject);
    });
  }

  /**
   * Parses atom data into a JSON object.
   *
   * @param {string} data
   * @returns {Promise}
   * @private
   */
  _parseStoriesFromFeed(data) {
    return new Promise((resolve, reject) => {
      xml2js.parseString(data, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.feed.entry);
        }
      });
    });
  }

  /**
   * Ensures that all stories are unique in case more than one subscribed
   * neighborhood contains the same story.
   *
   * @param {Array} stories
   * @returns {Array} uniqueStories
   * @private
   */
  _filterUniqueStories(stories) {
    const ids = [];

    const uniqueStories = stories.reduce((prev, curr) => {
      if (ids.indexOf(curr.id) === -1) {
        ids.push(curr.id);
        prev.push(curr);
      }

      return prev;
    }, []);

    return uniqueStories;
  }

  /**
   * Filters out old articles and only returns new articles.
   *
   * @param {Array} stories
   * @returns {Array}
   * @private
   */
  _filterNewArticles(stories) {
    return stories.filter(story => {
      return this._lastUpdatedTime < new Date(this._getPublishDateFromStory(story));
    });
  }

  /**
   * Gets the neighborhood data from its respective id.
   *
   * @param {string} id
   * @returns {Object} neighborhood
   * @private
   */
  _getNeighborhoodFromId(id) {
    for (let i = 0; i < neighborhoods.length; i++) {
      const neighborhood = neighborhoods[i];

      if (id === neighborhood.id) {
        return neighborhood;
      }
    }
  }

  /**
   * Gets the published date from a given story.
   *
   * @param {Object} story
   * @returns {string}
   * @private
   */
  _getPublishDateFromStory(story) {
    return story.published[0];
  }

  /**
   * Gets the title from a given story.
   *
   * @param {Object} story
   * @returns {string}
   * @private
   */
  _getTitleFromStory(story) {
    return story.title[0];
  }

  /**
   * Gets the summary from a given story.
   *
   * @param {Object} story
   * @returns {string}
   * @private
   */
  _getSummaryFromStory(story) {
    return story.summary[0].div[0].p[0];
  }

  /**
   * Gets the link for a given story.
   *
   * @param {Object} story
   * @returns {string}
   * @private
   */
  _getLinkFromStory(story) {
    return story.link[1].$.href;
  }

  /**
   * Public method to check for new stories.
   */
  checkForNewStories() {
    this._fetchNewStories();
  }
}

/**
 * Event names.
 *
 * @enum string
 * @readonly
 */
Feed.Events = {
  NEW_STORIES: 'new-stories'
};

/**
 * The polling frequency for the stories fetcher. 15 minutes.
 *
 * @type number
 * @readonly
 */
Feed.PollingFrequency = 1000 * 60 * 15;

module.exports = Feed;
