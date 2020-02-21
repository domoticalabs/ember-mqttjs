ember-mqttjs [![Build Status](https://travis-ci.com/domoticalabs/ember-mqttjs.svg?branch=master)](https://travis-ci.com/domoticalabs/ember-mqttjs)
==============================================================================

Ember async service for connecting to mqtt broker through [mqttjs library](https://github.com/mqttjs/MQTT.js).


Compatibility
------------------------------------------------------------------------------

* Ember.js v3.12 or above
* Ember CLI v2.13 or above
* Node.js v10 or above


Installation
------------------------------------------------------------------------------

```
ember install ember-mqttjs
```
Be sure that in your `ember-cli-build.js` you have the following rows to import ***mqtt*** *npm package*:
```
app.import('node_modules/mqtt/dist/mqtt.min.js',{
  using: [
    { transformation: 'amd', as: 'mqttjs' }
  ]
});
```

Usage
------------------------------------------------------------------------------

You have to import this service in your route or controller or component or service js class:
```
import { inject as service } from '@ember/service';
...
@service mqtt;
```
### connect(host, [username], [password]): *RSVP.Promise*
Connect to the mqtt host and register a listener to the `mqtt-message` event:
```
this.mqtt.connect('wss://test.mosquitto.org:8081').then( () => {
    // Do stuff on connection established
});
this.mqtt.on('mqtt-message', (sTopic, sMessage) => {
    // Do stuff with topic and message parameters
});
```
### subscribe(topic): *RSVP.Promise*
```
this.mqtt.subscribe('presence').then( (oGranted)=>{
    // Do stuff after succesfully subscription to mqttTopic
});
```
`oGranted` is an array of `{topic, qos}` where:
* *topic*: is a subscribed to topic
* *qos*: is the granted QoS level on it

### publish(topic, message): *RSVP.Promise*
```
this.mqtt.publish('presence', 'Hello').then( () => {
    // Do stuff after successfully published message
});
```

### unsubscribe(topic): *RSVP.Promise*
```
this.mqtt.unsubscribe('presence').then( (oGranted)=>{
    // Do stuff after succesfully unsubscription to mqttTopic
});
```

### mqtt-message [topic, message]: *Event*
New mqtt message received.
```
this.mqtt.on('mqtt-message', (sTopic, sMessage) => {
    // Do stuff with topic and message parameters
});
```

### mqtt-connected: *Event*
Connected event.

### mqtt-disconnected: *Event*
Disconnected event.

### mqtt-error: *Event*
Error event.

### mqtt-reconnect: *Event*
Fired when mqtt starts a reconnection

### mqtt-close: *Event*
Closed connection event.

### mqtt-offline: *Event*
Fired when mqtt goes offline.

Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
