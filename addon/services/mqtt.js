import Service from '@ember/service';
import Evented from '@ember/object/evented';

import { bind, later } from '@ember/runloop';

export default class MqttService extends Service.extend(Evented) {
  client;
  connected;

  constructor(){
    super(...arguments);
    this.client = null;
    this.connected = false;
    let _self = this;
    this.fConnecting = new Promise( (fResolve, fReject) => {
      _self.fConnected = fResolve;
      _self.fDisconnected = fReject;
    });
  }

  connect(sHost, sUsername, sPassword) {
    let _oOptions = {};
    if(typeof sUsername != 'undefined'){
      _oOptions['username'] = sUsername;
    }
    if(typeof sPassword != 'undefined'){
      _oOptions['password'] = sPassword;
    }
    import('mqtt/dist/mqtt').then(module => {
      const mqttjs = module.default;

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
    });

    return this.fConnecting;
  }

  async unsubscribe(sTopic){
    try{
      await this.fConnecting;
    } catch(oError) {
      return Promise.reject(oError);
    }
    this.client.unsubscribe(sTopic, (oError) => {
      if(oError){
        let _self = this;
        this.fConnecting = new Promise( (fResolve, fReject) => {
          _self.fConnected = fResolve;
          _self.fDisconnected = fReject;
        } );
        return Promise.reject(oError);
      }
      return Promise.resolve();
    });
  }

  async subscribe(sTopic) {
    try {
      await this.fConnecting;
    } catch {
      let _fSubscribe = bind(this, this.subscribe, sTopic);
      return later(await _fSubscribe, 100);
    }
    this.client.subscribe(sTopic, (oError, oGranted) => {
      if(oError){
        let _self = this;
        this.fConnecting = new Promise( (fResolve, fReject) => {
          _self.fConnected = fResolve;
          _self.fDisconnected = fReject;
        } );
        return Promise.reject(oError);
      }
      return Promise.resolve(oGranted);
    });
  }

  async publish(sTopic, sMessage, oOptions) {
    try{
      await this.fConnecting;
    } catch {
      let _fPublish = bind(this, this.publish, sTopic, sMessage, oOptions);
      return later(await _fPublish, 100);
    }
    this.client.publish(sTopic, sMessage, oOptions, (oError) => {
      if(oError){
        let _self = this;
        this.fConnecting = new Promise( (fResolve, fReject) => {
          _self.fConnected = fResolve;
          _self.fDisconnected = fReject;
        } );
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
    let _self = this;
    this.fConnecting = new Promise( (fResolve, fReject) => {
      _self.fConnected = fResolve;
      _self.fDisconnected = fReject;
    });
  }

  onClose(){
    this.connected = false;
    this.trigger('mqtt-close');
    this.fDisconnected();
  }

  onOffline(){
    this.connected = false;
    this.trigger('mqtt-offline');
  }
}
