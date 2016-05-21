/* global cast, castReceiverManager */

import extend from '../helpers/extend';
import successHandler from '../helpers/successHandler';
import errorHandler from '../helpers/errorHandler';

let debugState = false;

const sendMessage = (msg) => {
  if (debugState) {
    // eslint-disable-next-line
    console.log(msg);
  }
};

const noop = () => {};

const receiver = {
  create(userOpts, debug) {
    const defaults = {
      namespace: 'urn:x-cast:com.wiljan.test',
      onError: (debug) ? errorHandler : noop,
      onSuccess: (debug) ? successHandler : noop,
      onReady: (debug) ? successHandler : this.onReady,
      onSenderConnected: (debug) ? successHandler : noop,
      onSenderDisconnected: (debug) ? successHandler : noop,
      onSystemVolumeChanged: (debug) ? successHandler : noop,
      onMessage: (debug) ? successHandler : this.onMessage,
    };

    this.opts = extend({}, defaults, userOpts);

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

  onReady() {
    this.castReceiverManager.setApplicationState('Application status is ready...');
  },

  onMessage(event) {
    sendMessage(`Message [${event.senderId}]: ${event.data}`);
  },
};

export default receiver;
