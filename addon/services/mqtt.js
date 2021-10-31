import Service from '@ember/service';
import Evented from '@ember/object/evented';
import mqttjs from 'mqtt/dist/mqtt';
import { isEmpty } from '@ember/utils';

import { bind } from '@ember/runloop';

export default class MqttService extends Service.extend(Evented) {
  client;
  connected;

  constructor() {
    super(...arguments);
    this.client = null;
    this.connected = false;
    this.fConnecting = new Promise((fResolve, fReject) => {
      this.fConnected = fResolve;
      this.fDisconnected = fReject;
    });
  }

  get isConnected() {
    return this.connected;
  }

  connect(sHost, sUsername, sPassword) {
    let _oOptions = {};
    if (!isEmpty(sUsername)) {
      _oOptions['username'] = sUsername;
    }
    if (!isEmpty(sPassword)) {
      _oOptions['password'] = sPassword;
    }
    this.client = mqttjs.connect(sHost, _oOptions);
    let _fOnMessage = bind(this, this.onMessage);
    this.client.on('message', _fOnMessage);
    let _fOnConnect = bind(this, this.onConnect);
    this.client.on('connect', _fOnConnect);
    let _fOnReconnect = bind(this, this.onReconnect);
    this.client.on('reconnect', _fOnReconnect);
    let _fOnError = bind(this, this.onError);
    this.client.on('error', _fOnError);
    let _fOnDisconnect = bind(this, this.onDisconnect);
    this.client.on('disconnect', _fOnDisconnect);
    let _fOnClose = bind(this, this.onClose);
    this.client.on('close', _fOnClose);
    let _fOnOffline = bind(this, this.onOffline);
    this.client.on('offline', _fOnOffline);

    return this.fConnecting;
  }

  async unsubscribe(sTopic) {
    try {
      await this.fConnecting;
    } catch (oError) {
      return Promise.reject(oError);
    }
    return this.client.unsubscribe(sTopic, (oError) => {
      if (oError) {
        this.fConnecting = new Promise((fResolve, fReject) => {
          this.fConnected = fResolve;
          this.fDisconnected = fReject;
        });
        return Promise.reject(oError);
      }
      return Promise.resolve();
    });
  }

  async subscribe(sTopic) {
    if (!this.isConnected) {
      try {
        await this.fConnecting;
      } catch (oError) {
        return this.fDisconnected(oError);
      }
    }
    return this.client.subscribe(sTopic, (oError, oGranted) => {
      if (oError) {
        this.fConnecting = new Promise((fResolve, fReject) => {
          this.fConnected = fResolve;
          this.fDisconnected = fReject;
        });
        return Promise.reject(oError);
      }
      return Promise.resolve(oGranted);
    });
  }

  async publish(sTopic, sMessage, oOptions) {
    if (!this.isConnected) {
      try {
        await this.fConnecting;
      } catch (oError) {
        return this.fDisconnected(oError);
      }
    }
    return this.client.publish(sTopic, sMessage, oOptions, (oError) => {
      if (oError) {
        this.fConnecting = new Promise((fResolve, fReject) => {
          this.fConnected = fResolve;
          this.fDisconnected = fReject;
        });
        return Promise.reject(oError);
      }
      return Promise.resolve();
    });
  }

  onMessage(sTopic, sMessage) {
    this.trigger('mqtt-message', sTopic, sMessage);
  }

  onConnect() {
    this.connected = true;
    this.trigger('mqtt-connected');
    this.fConnected();
  }

  onDisconnect() {
    this.connected = false;
    this.trigger('mqtt-disconnected');
    this.fDisconnected();
  }

  onError() {
    this.connected = false;
    this.trigger('mqtt-error');
    this.fDisconnected();
  }

  onReconnect() {
    this.connected = false;
    this.trigger('mqtt-reconnect');
    this.fConnecting = new Promise((fResolve, fReject) => {
      this.fConnected = fResolve;
      this.fDisconnected = fReject;
    });
  }

  onClose() {
    this.connected = false;
    this.trigger('mqtt-close');
    this.fDisconnected();
  }

  onOffline() {
    this.connected = false;
    this.trigger('mqtt-offline');
    this.fDisconnected();
  }
}
