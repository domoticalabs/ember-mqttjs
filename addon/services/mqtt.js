import Service from '@ember/service';
import Evented from '@ember/object/evented';

import mqttjs from 'mqttjs';
import { bind, later } from '@ember/runloop';
import RSVP from 'rsvp';

export default class MqttService extends Service.extend(Evented) {
  client;
  connected;

  constructor(){
    super(...arguments);
    this.client = null;
    this.connected = false;
    let _self = this;
    this.fConnecting = new RSVP.Promise( (fResolve, fReject) => {
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

  unsubscribe(sTopic){
    let _self = this;
    return new RSVP.Promise( (fResolve, fReject) => {
      return _self.fConnecting.then( () => {
        _self.client.unsubscribe(sTopic, (oError) => {
          if(oError){
            _self.fConnecting = new RSVP.Promise( (fResolve, fReject) => {
              _self.fConnected = fResolve;
              _self.fDisconnected = fReject;
            } );
            return fReject(oError);
          }
          return fResolve();
        });
      });
    });
  }

  subscribe(sTopic) {
    let _self = this;
    return new RSVP.Promise( (fResolve, fReject) => {
      return _self.fConnecting.then( () => {
        _self.client.subscribe(sTopic, (oError, oGranted) => {
          if(oError){
            _self.fConnecting = new RSVP.Promise( (fResolve, fReject) => {
              _self.fConnected = fResolve;
              _self.fDisconnected = fReject;
            } );
            return fReject(oError);
          }
          return fResolve(oGranted);
        });
      }).catch( () => {
        let _fSubscribe = bind(_self, _self.subscribe, sTopic);
        return later(_fSubscribe, 100);
      });
    });
  }

  publish(sTopic, sMessage, oOptions) {
    let _self = this;
    return new RSVP.Promise( (fResolve, fReject) => {
      return _self.fConnecting.then( () => {
        _self.client.publish(sTopic, sMessage, oOptions, (oError) => {
          if(oError){
            _self.fConnecting = new RSVP.Promise( (fResolve, fReject) => {
              _self.fConnected = fResolve;
              _self.fDisconnected = fReject;
            } );
            return fReject(oError);
          }
          return fResolve();
        });
      }).catch( () => {
        let _fPublish = bind(_self, _self.publish, sTopic, sMessage, oOptions);
        return later(_fPublish, 100);
      });
    });
  }

  onMessage(sTopic, sMessage) {
    this.trigger('mqtt-message', sTopic, sMessage);
  }

  onConnect() {
    this.connected = true;
    this.fConnected();
  }

  onDisconnect() {
    this.connected = false;
    this.fDisconnected();
  }

  onError() {
    this.connected = false;
    this.fDisconnected();
  }

  onReconnect() {
    this.connected = false;
    let _self = this;
    this.fConnecting = new RSVP.Promise( (fResolve, fReject) => {
      _self.fConnected = fResolve;
      _self.fDisconnected = fReject;
    });
  }

  onClose(){
    this.connected = false;
    this.fDisconnected();
  }

  onOffline(){
    this.connected = false;
  }
}
