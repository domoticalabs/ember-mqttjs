import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import mqttjs from 'mqtt/dist/mqtt';
import Service from '@ember/service';
import Evented from '@ember/object/evented';
import { later } from '@ember/runloop';

class MqttServiceStub extends Service.extend(Evented) {}

module('Unit | Service | mqtt', function (hooks) {
  let mqttHost = 'ws://localhost:8883';
  let mqttTopic = 'presence';
  let mqttMessage = 'Hello';

  let mqttServiceStub;

  setupTest(hooks);

  hooks.afterEach(() => {
    sinon.restore();
  });

  // Testing mqttjs import
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:mqtt');
    assert.ok(service);
  });

  //Testing mqtt connect
  test('mqtt connect success', async function (assert) {
    let service = this.owner.lookup('service:mqtt');
    let done = assert.async();
    assert.expect(3);
    mqttServiceStub = new MqttServiceStub();
    sinon.replace(
      mqttjs,
      'connect',
      sinon.fake(() => {
        later(() => {
          mqttServiceStub.trigger('connect');
        }, 100);
        return {
          on: (sEvent) => {
            mqttServiceStub.on(sEvent, () => {
              if (sEvent === 'connect') {
                return service.onConnect();
              }
            });
          },
        };
      })
    );
    try {
      service.on('mqtt-connected', () => {
        assert.ok(true);
      });
      await service.connect(mqttHost);
      assert.ok(service);
      assert.ok(service.isConnected);
    } catch {
      assert.ok(false);
      assert.ok(false);
      assert.ok(false);
    } finally {
      done();
    }
  });

  test('mqtt connect error', async function (assert) {
    let service = this.owner.lookup('service:mqtt');
    let done = assert.async();
    assert.expect(3);
    mqttServiceStub = new MqttServiceStub();
    sinon.replace(
      mqttjs,
      'connect',
      sinon.fake(() => {
        later(() => {
          mqttServiceStub.trigger('error');
        }, 100);
        return {
          on: (sEvent) => {
            mqttServiceStub.on(sEvent, () => {
              if (sEvent === 'error') {
                return service.onError();
              }
            });
          },
        };
      })
    );
    try {
      service.on('mqtt-error', () => {
        assert.ok(true);
      });
      await service.connect(mqttHost);
      assert.ok(false);
      assert.ok(false);
    } catch {
      assert.ok(service);
      assert.notOk(service.isConnected);
    } finally {
      done();
    }
  });

  // // Testing mqtt subscribe
  test('mqtt subscribe success', async function (assert) {
    assert.expect(1);
    let done = assert.async();
    let service = this.owner.lookup('service:mqtt');
    mqttServiceStub = new MqttServiceStub();
    sinon.replace(
      mqttjs,
      'connect',
      sinon.fake(() => {
        later(() => {
          mqttServiceStub.trigger('connect');
        }, 100);
        return {
          on: (sEvent) => {
            mqttServiceStub.on(sEvent, () => {
              if (sEvent === 'connect') {
                return service.onConnect();
              }
            });
          },
          subscribe: (sTopic, sCallback) => {
            return sCallback(null, [{ topic: sTopic }]);
          },
        };
      })
    );
    try {
      await service.connect(mqttHost);
      let _oGranted = await service.subscribe(mqttTopic);
      assert.strictEqual(_oGranted[0].topic, mqttTopic);
    } catch {
      assert.ok(false);
    } finally {
      done();
    }
  });

  test('mqtt subscribe error', async function (assert) {
    assert.expect(1);
    let done = assert.async();
    let service = this.owner.lookup('service:mqtt');
    mqttServiceStub = new MqttServiceStub();
    sinon.replace(
      mqttjs,
      'connect',
      sinon.fake(() => {
        later(() => {
          mqttServiceStub.trigger('connect');
        }, 100);
        return {
          on: (sEvent) => {
            mqttServiceStub.on(sEvent, () => {
              if (sEvent === 'connect') {
                return service.onConnect();
              }
            });
          },
          subscribe: (sTopic, sCallback) => {
            return sCallback({ message: 'Error' }, [{ topic: sTopic }]);
          },
        };
      })
    );
    try {
      await service.connect(mqttHost);
      await service.subscribe(mqttTopic);
      assert.ok(false);
    } catch (oError) {
      assert.strictEqual(oError.message, 'Error');
    } finally {
      done();
    }
  });

  test('mqtt publish success', async function (assert) {
    assert.expect(3);
    let done = assert.async();
    let service = this.owner.lookup('service:mqtt');
    mqttServiceStub = new MqttServiceStub();
    sinon.replace(
      mqttjs,
      'connect',
      sinon.fake(() => {
        later(() => {
          mqttServiceStub.trigger('connect');
        }, 100);
        return {
          on: (sEvent) => {
            mqttServiceStub.on(sEvent, () => {
              if (sEvent === 'connect') {
                return service.onConnect();
              } else if (sEvent === 'message') {
                return service.onMessage(mqttTopic, mqttMessage);
              }
            });
          },
          subscribe: (sTopic, sCallback) => {
            return sCallback(null, [{ topic: sTopic }]);
          },
          publish: (sTopic, sMessage, oOptions, sCallback) => {
            later(() => {
              mqttServiceStub.trigger('message', sTopic, sMessage);
            }, 100);
            return sCallback(null);
          },
        };
      })
    );
    try {
      await service.connect(mqttHost);
      let _oGranted = await service.subscribe(mqttTopic);
      assert.strictEqual(_oGranted[0].topic, mqttTopic);
    } catch {
      assert.ok(false);
    }
    try {
      service.on('mqtt-message', (sTopic, sMessage) => {
        assert.strictEqual(sTopic, mqttTopic);
        assert.strictEqual(sMessage, mqttMessage);
      });
      await service.publish(mqttTopic, mqttMessage);
    } catch {
      assert.ok(false);
      assert.ok(false);
    } finally {
      done();
    }
  });

  test('mqtt publish error', async function (assert) {
    assert.expect(2);
    let done = assert.async();
    let service = this.owner.lookup('service:mqtt');
    mqttServiceStub = new MqttServiceStub();
    sinon.replace(
      mqttjs,
      'connect',
      sinon.fake(() => {
        later(() => {
          mqttServiceStub.trigger('connect');
        }, 100);
        return {
          on: (sEvent) => {
            mqttServiceStub.on(sEvent, () => {
              if (sEvent === 'connect') {
                return service.onConnect();
              }
            });
          },
          subscribe: (sTopic, sCallback) => {
            return sCallback(null, [{ topic: sTopic }]);
          },
          publish: (sTopic, sMessage, oOptions, sCallback) => {
            return sCallback({ message: 'Error' });
          },
        };
      })
    );
    try {
      await service.connect(mqttHost);
      let _oGranted = await service.subscribe(mqttTopic);
      assert.strictEqual(_oGranted[0].topic, mqttTopic);
    } catch {
      assert.ok(false);
    }
    try {
      await service.publish(mqttTopic, mqttMessage);
      assert.ok(false);
    } catch (oError) {
      assert.strictEqual(oError.message, 'Error');
    } finally {
      done();
    }
  });

  test('mqtt close', async function (assert) {
    let service = this.owner.lookup('service:mqtt');
    let done = assert.async();
    assert.expect(3);
    mqttServiceStub = new MqttServiceStub();
    sinon.replace(
      mqttjs,
      'connect',
      sinon.fake(() => {
        later(() => {
          mqttServiceStub.trigger('close');
        }, 100);
        return {
          on: (sEvent) => {
            mqttServiceStub.on(sEvent, () => {
              if (sEvent === 'close') {
                return service.onClose();
              }
            });
          },
        };
      })
    );
    try {
      service.on('mqtt-close', () => {
        assert.ok(true);
      });
      await service.connect(mqttHost);
      assert.ok(false);
      assert.ok(false);
    } catch {
      assert.ok(service);
      assert.notOk(service.isConnecting);
    } finally {
      done();
    }
  });

  test('mqtt offline', async function (assert) {
    let service = this.owner.lookup('service:mqtt');
    let done = assert.async();
    assert.expect(3);
    mqttServiceStub = new MqttServiceStub();
    sinon.replace(
      mqttjs,
      'connect',
      sinon.fake(() => {
        later(() => {
          mqttServiceStub.trigger('offline');
        }, 100);
        return {
          on: (sEvent) => {
            mqttServiceStub.on(sEvent, () => {
              if (sEvent === 'offline') {
                return service.onOffline();
              }
            });
          },
        };
      })
    );
    try {
      service.on('mqtt-offline', () => {
        assert.ok(true);
      });
      await service.connect(mqttHost);
      assert.ok(false);
      assert.ok(false);
    } catch {
      assert.ok(service);
      assert.notOk(service.isConnecting);
    } finally {
      done();
    }
  });
});
