import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | mqtt', function (hooks) {
  let mqttHost = 'wss://test.mosquitto.org:8081';
  let mqttTopic = 'presence';
  let mqttMessage = 'Hello';
  let mqttEvent = 'mqtt-message';

  setupTest(hooks);

  // Testing mqttjs import
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:mqtt');
    assert.ok(service);
  });

  // Testing mqtt connect
  test('mqtt connect', function (assert) {
    let service = this.owner.lookup('service:mqtt');
    let done = assert.async();
    service
      .connect(mqttHost)
      .then(function () {
        assert.ok(service);
        done();
      })
      .catch(function () {
        done();
      });
  });

  // Testing mqtt wrong connection
  test('mqtt not connected', function (assert) {
    let service = this.owner.lookup('service:mqtt');
    let done = assert.async();
    service
      .connect(mqttHost.replace('8081', ''))
      .then(function () {
        done();
      })
      .catch(function () {
        assert.ok(service);
        done();
      });
  });

  // Testing mqtt subscribe
  test('mqtt subscribe', async function (assert) {
    let service = this.owner.lookup('service:mqtt');
    let done = assert.async();
    try {
      await service.connect(mqttHost);
    } catch (oError) {
      done();
      return oError;
    }
    let _oGranted;
    try {
      _oGranted = await service.subscribe(mqttTopic);
    } catch (oError) {
      done();
      return oError;
    }
    if (_oGranted && _oGranted[0]) {
      assert.equal(_oGranted[0].topic, mqttTopic);
    }
    done();
  });

  // Testing mqtt publish
  test('mqtt publish', function (assert) {
    let service = this.owner.lookup('service:mqtt');
    let done = assert.async();
    service
      .connect(mqttHost)
      .then(() => {
        service
          .subscribe(mqttTopic)
          .then(() => {
            service
              .publish(mqttTopic, mqttMessage)
              .then(() => {
                service.on(mqttEvent, (sTopic, sMessage) => {
                  assert.equal(sTopic, mqttTopic);
                  assert.equal(sMessage, mqttMessage);
                  done();
                });
              })
              .catch(() => {
                done();
              });
          })
          .catch(() => {
            done();
          });
      })
      .catch(() => {
        done();
      });
  });
});
