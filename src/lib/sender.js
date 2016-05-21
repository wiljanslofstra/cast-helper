/* globals chrome */

import extend from '../helpers/extend';
import successHandler from '../helpers/successHandler';
import errorHandler from '../helpers/errorHandler';

const noop = () => {};

let session;

const sender = {
  create(userOpts, debug = false) {
    const defaults = {
      namespace: 'urn:x-cast:com.wiljan.test',
      applicationID: '12345678',
      onError: (debug) ? errorHandler : noop,
      onSuccess: (debug) ? successHandler : noop,
      onInitSuccess: (debug) ? successHandler : noop,
      onStopAppSuccess: (debug) ? successHandler : noop,
      onSessionSuccess: (debug) ? successHandler : noop,
      onReceiversSuccess: (debug) ? successHandler : noop,
      onReceiversError: (debug) ? successHandler : noop,
    };

    this.opts = extend({}, defaults, userOpts);

    // Wait for Cast API to be available
    window.__onGCastApiAvailable = (loaded, errorInfo) => {
      if (loaded) {
        this.initializeCastApi();
      } else {
        throw new Error(errorInfo);
      }
    };
  },

  initializeCastApi() {
    // Initialize session with application ID
    const sessionRequest = new chrome.cast.SessionRequest(
      this.opts.applicationID
    );

    // Create configuration with a few callback methods
    const apiConfig = new chrome.cast.ApiConfig(
      sessionRequest,
      this.sessionListener.bind(this),
      this.receiverListener.bind(this)
    );

    // Initialize the API
    chrome.cast.initialize(
      apiConfig,
      this.opts.onInitSuccess.bind(this, { message: 'Initialisation successful' }),
      this.opts.onError
    );
  },

  /**
   * Called after a session has been established
   * @param  {Object} e Session object
   * @return {Void}
   */
  sessionListener(e) {
    this.opts.onSessionSuccess({ sessionId: e.sessionId });

    // Save session to variable for later usage
    session = e;

    // Keep alive listener
    session.addUpdateListener(
      this.sessionUpdateListener
    );
  },

  /**
   * Callback from the session on update
   * @param  {Boolean} isAlive Is the connection still alive
   * @return {Void}
   */
  sessionUpdateListener(isAlive) {
    if (!isAlive) {
      session = null;
    }
  },

  /**
   * Callback for receivers
   * @param  {String} e Available or unavailable
   * @return {Void}
   */
  receiverListener(e) {
    // Check if any receivers are available
    if (e === chrome.cast.ReceiverAvailability.AVAILABLE) {
      this.opts.onReceiversSuccess({ message: 'Receivers available' });
    } else {
      this.opts.onReceiversError({ message: 'No receivers available' });
    }
  },

  /**
   * Check if a session is available, if not create one
   * @param  {Function} cb Callback after a session has been found or created
   * @return {Void}
   */
  checkSession(cb) {
    // If a session is available we can immediately callback
    if (session) {
      cb.call();
    } else {
      // Request a new session
      chrome.cast.requestSession((e) => {
        // Save session
        session = e;

        // Call the session callback
        this.sessionListener(e);

        // Callback
        cb.call();
      }, this.opts.onError);
    }
  },

  /**
   * Send a message to the receiver
   * @param  {Object} message Object to send to the receiver
   * @return {Void}
   */
  sendMessage(message) {
    // First check if a session is available
    this.checkSession(() => {
      // Send a message with the session
      session.sendMessage(
        this.opts.namespace,
        message,
        this.opts.onSuccess.bind(this, message),
        this.opts.onError
      );
    });
  },

  /**
   * Launch the application by sending the first message
   * @return {Void}
   */
  launch() {
    this.sendMessage({ message: 'launch' });
  },

  /**
   * Stop the application
   * @return {Void}
   */
  stop() {
    if (session) {
      session.stop(
        this.opts.onStopAppSuccess,
        this.opts.onError
      );
    }
  },
};

export default sender;
