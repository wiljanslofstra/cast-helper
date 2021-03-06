(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.castHelper = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (message) {
  console.log("onError: " + JSON.stringify(message));
};

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = extend;
function extend(base) {
  var res = base;

  for (var _len = arguments.length, parts = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    parts[_key - 1] = arguments[_key];
  }

  parts.forEach(function (p) {
    if (p && (typeof p === 'undefined' ? 'undefined' : _typeof(p)) === 'object') {
      for (var k in p) {
        if (p.hasOwnProperty(k)) {
          res[k] = p[k];
        }
      }
    }
  });

  return res;
}

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (message) {
  console.log("onSuccess: " + JSON.stringify(message));
};

},{}],4:[function(require,module,exports){
'use strict';

var _sender = require('./lib/sender');

var _sender2 = _interopRequireDefault(_sender);

var _receiver = require('./lib/receiver');

var _receiver2 = _interopRequireDefault(_receiver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Use module.exports instead of export default for easier global usage
module.exports = {
  sender: _sender2.default,
  receiver: _receiver2.default
};

},{"./lib/receiver":5,"./lib/sender":6}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extend = require('../helpers/extend');

var _extend2 = _interopRequireDefault(_extend);

var _successHandler = require('../helpers/successHandler');

var _successHandler2 = _interopRequireDefault(_successHandler);

var _errorHandler = require('../helpers/errorHandler');

var _errorHandler2 = _interopRequireDefault(_errorHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debugState = false; /* global cast, castReceiverManager */

var sendMessage = function sendMessage(msg) {
  if (debugState) {
    // eslint-disable-next-line
    console.log(msg);
  }
};

var noop = function noop() {};

var receiver = {
  create: function create(userOpts, debug) {
    var defaults = {
      namespace: 'urn:x-cast:com.wiljan.test',
      onError: debug ? _errorHandler2.default : noop,
      onSuccess: debug ? _successHandler2.default : noop,
      onReady: debug ? _successHandler2.default : this.onReady,
      onSenderConnected: debug ? _successHandler2.default : noop,
      onSenderDisconnected: debug ? _successHandler2.default : noop,
      onSystemVolumeChanged: debug ? _successHandler2.default : noop,
      onMessage: debug ? _successHandler2.default : this.onMessage
    };

    this.opts = (0, _extend2.default)({}, defaults, userOpts);

    debugState = debug;

    cast.receiver.logger.setLevelValue(0);

    this.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();

    sendMessage('Starting Receiver Manager');

    this.castReceiverManager.onReady = this.opts.onReady;
    this.castReceiverManager.onSenderConnected = this.opts.onSenderConnected;
    this.castReceiverManager.onSenderDisconnected = this.opts.onSenderDisconnected;
    this.castReceiverManager.onSystemVolumeChanged = this.opts.onSystemVolumeChanged;

    // create a CastMessageBus to handle messages for a custom namespace
    this.messageBus = this.castReceiverManager.getCastMessageBus(this.opts.namespace);

    // handler for the CastMessageBus message event
    this.messageBus.onMessage = this.onMessage;

    // Initialize the CastReceiverManager with an application status message
    this.castReceiverManager.start({ statusText: 'Application is starting' });

    sendMessage('Receiver Manager started');
  },
  onReady: function onReady() {
    this.castReceiverManager.setApplicationState('Application status is ready...');
  },
  onMessage: function onMessage(event) {
    sendMessage('Message [' + event.senderId + ']: ' + event.data);
  }
};

exports.default = receiver;

},{"../helpers/errorHandler":1,"../helpers/extend":2,"../helpers/successHandler":3}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extend = require('../helpers/extend');

var _extend2 = _interopRequireDefault(_extend);

var _successHandler = require('../helpers/successHandler');

var _successHandler2 = _interopRequireDefault(_successHandler);

var _errorHandler = require('../helpers/errorHandler');

var _errorHandler2 = _interopRequireDefault(_errorHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var noop = function noop() {}; /* globals chrome */

var session = void 0;

var sender = {
  create: function create(userOpts) {
    var _this = this;

    var debug = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    var defaults = {
      namespace: 'urn:x-cast:com.wiljan.test',
      applicationID: '12345678',
      onError: debug ? _errorHandler2.default : noop,
      onSuccess: debug ? _successHandler2.default : noop,
      onInitSuccess: debug ? _successHandler2.default : noop,
      onStopAppSuccess: debug ? _successHandler2.default : noop,
      onSessionSuccess: debug ? _successHandler2.default : noop,
      onReceiversSuccess: debug ? _successHandler2.default : noop,
      onReceiversError: debug ? _successHandler2.default : noop
    };

    this.opts = (0, _extend2.default)({}, defaults, userOpts);

    // Wait for Cast API to be available
    window.__onGCastApiAvailable = function (loaded, errorInfo) {
      if (loaded) {
        _this.initializeCastApi();
      } else {
        throw new Error(errorInfo);
      }
    };
  },
  initializeCastApi: function initializeCastApi() {
    // Initialize session with application ID
    var sessionRequest = new chrome.cast.SessionRequest(this.opts.applicationID);

    // Create configuration with a few callback methods
    var apiConfig = new chrome.cast.ApiConfig(sessionRequest, this.sessionListener.bind(this), this.receiverListener.bind(this));

    // Initialize the API
    chrome.cast.initialize(apiConfig, this.opts.onInitSuccess.bind(this, { message: 'Initialisation successful' }), this.opts.onError);
  },


  /**
   * Called after a session has been established
   * @param  {Object} e Session object
   * @return {Void}
   */
  sessionListener: function sessionListener(e) {
    this.opts.onSessionSuccess({ sessionId: e.sessionId });

    // Save session to variable for later usage
    session = e;

    // Keep alive listener
    session.addUpdateListener(this.sessionUpdateListener);
  },


  /**
   * Callback from the session on update
   * @param  {Boolean} isAlive Is the connection still alive
   * @return {Void}
   */
  sessionUpdateListener: function sessionUpdateListener(isAlive) {
    if (!isAlive) {
      session = null;
    }
  },


  /**
   * Callback for receivers
   * @param  {String} e Available or unavailable
   * @return {Void}
   */
  receiverListener: function receiverListener(e) {
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
  checkSession: function checkSession(cb) {
    var _this2 = this;

    // If a session is available we can immediately callback
    if (session) {
      cb.call();
    } else {
      // Request a new session
      chrome.cast.requestSession(function (e) {
        // Save session
        session = e;

        // Call the session callback
        _this2.sessionListener(e);

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
  sendMessage: function sendMessage(message) {
    var _this3 = this;

    // First check if a session is available
    this.checkSession(function () {
      // Send a message with the session
      session.sendMessage(_this3.opts.namespace, message, _this3.opts.onSuccess.bind(_this3, message), _this3.opts.onError);
    });
  },


  /**
   * Launch the application by sending the first message
   * @return {Void}
   */
  launch: function launch() {
    this.sendMessage({ message: 'launch' });
  },


  /**
   * Stop the application
   * @return {Void}
   */
  stop: function stop() {
    if (session) {
      session.stop(this.opts.onStopAppSuccess, this.opts.onError);
    }
  }
};

exports.default = sender;

},{"../helpers/errorHandler":1,"../helpers/extend":2,"../helpers/successHandler":3}]},{},[4])(4)
});


//# sourceMappingURL=build.js.map
