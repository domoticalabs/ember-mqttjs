ember-mqttjs [![CI](https://github.com/domoticalabs/ember-mqttjs/actions/workflows/ci.yml/badge.svg)](https://github.com/domoticalabs/ember-mqttjs/actions/workflows/ci.yml)
==============================================================================

Ember async service for connecting to mqtt broker through [mqttjs library](https://github.com/mqttjs/MQTT.js).


Compatibility
------------------------------------------------------------------------------

* Ember.js v3.20 or above
* Ember CLI v3.20 or above
* Node.js v10 or above


Installation
------------------------------------------------------------------------------

```
ember install ember-mqttjs
```


Usage
------------------------------------------------------------------------------

You have to import this service in your route or controller or component or service js class:
```js
import { inject as service } from '@ember/service';
...
@service mqtt;
```
### connect(host, [username], [password]): *RSVP.Promise*
Connect to the mqtt host and register a listener to the `mqtt-message` event:
```js
this.mqtt.connect('wss://test.mosquitto.org:8081').then( () => {
    // Do stuff on connection established
});
this.mqtt.on('mqtt-message', (sTopic, sMessage) => {
    // Do stuff with topic and message parameters
});
```
### subscribe(topic): *RSVP.Promise*
```js
this.mqtt.subscribe('presence').then( (oGranted)=>{
    // Do stuff after succesfully subscription to mqttTopic
});
```
`oGranted` is an array of `{topic, qos}` where:
* *topic*: is a subscribed to topic
* *qos*: is the granted QoS level on it

### publish(topic, message): *RSVP.Promise*
```js
this.mqtt.publish('presence', 'Hello').then( () => {
    // Do stuff after successfully published message
});
```

### unsubscribe(topic): *RSVP.Promise*
```js
this.mqtt.unsubscribe('presence').then( (oGranted)=>{
    // Do stuff after succesfully unsubscription to mqttTopic
});
```

### mqtt-message [topic, message]: *Event*
New mqtt message received.
```js
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
