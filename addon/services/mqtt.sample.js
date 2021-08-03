import mqttjs from 'mqtt/dist/mqtt';

export default class MqttService {
  client;
  connected;

  constructor() {
    this.client = null;
    this.connected = false;
    let _self = this;
    this.fConnecting = new Promise((fResolve, fReject) => {
      _self.fConnected = fResolve;
      _self.fDisconnected = fReject;
    });
  }

  connect(sHost, sUsername, sPassword) {
    let _oOptions = {};
    if (typeof sUsername != 'undefined') {
      _oOptions['username'] = sUsername;
    }
    if (typeof sPassword != 'undefined') {
      _oOptions['password'] = sPassword;
    }
    this.client = mqttjs.connect(sHost, _oOptions);
    let _fOnMessage = this.onMessage.bind(this);
    this.client.on('message', _fOnMessage);
    let _fOnConnect = this.onConnect.bind(this);
    this.client.on('connect', _fOnConnect);
    let _fOnReconnect = this.onReconnect.bind(this);
    this.client.on('reconnect', _fOnReconnect);
    let _fOnError = this.onError.bind(this);
    this.client.on('error', _fOnError);
    let _fOnDisconnect = this.onDisconnect.bind(this);
    this.client.on('disconnect', _fOnDisconnect);
    let _fOnClose = this.onClose.bind(this);
    this.client.on('close', _fOnClose);
    let _fOnOffline = this.onOffline.bind(this);
    this.client.on('offline', _fOnOffline);

    return this.fConnecting;
  }

  async unsubscribe(sTopic) {
    try {
      await this.fConnecting;
    } catch (oError) {
      return Promise.reject(oError);
    }
    this.client.unsubscribe(sTopic, (oError) => {
      if (oError) {
        let _self = this;
        this.fConnecting = new Promise((fResolve, fReject) => {
          _self.fConnected = fResolve;
          _self.fDisconnected = fReject;
        });
        return Promise.reject(oError);
      }
      return Promise.resolve();
    });
  }

  async subscribe(sTopic) {
    try {
      await this.fConnecting;
    } catch (oError) {
      // let _fSubscribe = bind(this, this.subscribe, sTopic);
      // return later(await _fSubscribe, 100);
      return this.fDisconnected(oError);
    }
    return new Promise((fResolve, fReject) => {
      this.client.subscribe(sTopic, (oError, oGranted) => {
        if (oError) {
          let _self = this;
          this.fConnecting = new Promise((fNewResolve, fNewReject) => {
            _self.fConnected = fNewResolve;
            _self.fDisconnected = fNewReject;
          });
          return fReject(oError);
        }
        return fResolve(oGranted);
      });
    });
  }

  async publish(sTopic, sMessage, oOptions) {
    try {
      await this.fConnecting;
    } catch (oError) {
      // let _fPublish = bind(this, this.publish, sTopic, sMessage, oOptions);
      // return later(await _fPublish, 100);
      return this.fDisconnected(oError);
    }
    this.client.publish(sTopic, sMessage, oOptions, (oError) => {
      if (oError) {
        let _self = this;
        this.fConnecting = new Promise((fResolve, fReject) => {
          _self.fConnected = fResolve;
          _self.fDisconnected = fReject;
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
    let _self = this;
    this.fConnecting = new Promise((fResolve, fReject) => {
      _self.fConnected = fResolve;
      _self.fDisconnected = fReject;
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
  }
}
