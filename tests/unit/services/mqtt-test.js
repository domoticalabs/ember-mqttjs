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

  //Testing mqtt connect
  test('mqtt connect', async function (assert) {
    let service = this.owner.lookup('service:mqtt');
    let done = assert.async();
    assert.expect(1);
    try {
      await service.connect(mqttHost);
      assert.ok(service);
    } finally {
      done();
    }
  });

  // // Testing mqtt subscribe
  test('mqtt subscribe', async function (assert) {
    assert.expect(1);
    let service = this.owner.lookup('service:mqtt');
    let done = assert.async();
    try {
      await service.connect(mqttHost);
      let _oGranted;
      _oGranted = await service.subscribe(mqttTopic);
      assert.equal(_oGranted[0].topic, mqttTopic);
    } finally {
      done();
    }
  });

  // // Testing mqtt publish
  test('mqtt publish', function (assert) {
    assert.expect(2);
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
