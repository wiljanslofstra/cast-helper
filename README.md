# Cast helper
Wrapper for the Cast API to make it easier to setup a sender and receiver

## Usage

### Sender
```html
<!-- Load Google's Cast Sender script -->
<script type="text/javascript" src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js"></script>

<!-- Load this library -->
<script type="text/javascript" src="cast-helper.js"></script>

<script type="text/javascript">
  castHelper.sender.create({
    applicationID: '12345678',
    namespace: 'urn:x-cast:com.namespace.test'
  });
</script>
```
After the setup has been done we can send messages to the receiver to start the application
```html
<button onclick="castHelper.sender.launch()">
  Launch!
</button>
```

### Receiver
```html
<!-- Load receiver script -->
<script type="text/javascript" src="//www.gstatic.com/cast/sdk/libs/receiver/2.0.0/cast_receiver.js"></script>

<!-- Load this library -->
<script type="text/javascript" src="cast-helper.js"></script>

<!-- Create the receiver -->
<script type="text/javascript">
  castHelper.receiver.create({
    namespace: 'urn:x-cast:com.namespace.test'
  }, true);
</script>
```
We can receive and use messages from the sender with the onMessage callback:
```javascript
castHelper.receiver.create({
  namespace: 'urn:x-cast:com.namespace.test',
  onMessage: function(message) {
    console.log(message);
  }
}, true);
```

## Methods
```javascript
// Initialize the Cast API
castHelper.sender.create(Options, Debug)

// Send a message to the receiver
castHelper.sender.sendMessage(Message)

// Start the receiver, same as sendMessage but with a predefined message
castHelper.sender.launch()

// Stop the session
castHelper.sender.stop()

// Create the receiver
castHelper.receiver.create(Options, Debug)
```

## Options
```javascript
// Sender options:
{
  // Made up namespace, this needs to be the same between sender and receiver to communicate
  namespace: 'urn:x-cast:com.wiljan.test',

  // Application ID can be obtained from the Google Cast SDK Developer Console
  applicationID: '12345678',

  // Callbacks
  onError: function() {},
  onSuccess: function() {},
  onInitSuccess: function() {},
  onStopAppSuccess: function() {},
  onSessionSuccess: function() {},
  onReceiversSuccess: function() {},
  onReceiversError: function() {},
},

// Receiver options
{
  namespace: 'urn:x-cast:com.wiljan.test',
  onError: function() {},
  onSuccess: function() {},
  onReady: function() {},
  onSenderConnected: function() {},
  onSenderDisconnected: function() {},
  onSystemVolumeChanged: function({ data: { level: Integer, muted: Boolean }}) {},
  onMessage: function(message) {},
}
```
