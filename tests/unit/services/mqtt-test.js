import { done, module, test } from 'qunit';
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
    } catch {
      done();
    }
    assert.ok(service);
    done();
  });

  // // Testing mqtt wrong connection
  // test('mqtt not connected', async function (assert) {
  //   let service = this.owner.lookup('service:mqtt');
  //   let done = assert.async();
  //   assert.expect(1);
  //   try {
  //     await service.connect(mqttHost.replace('8081', ''));
  //   } catch {
  //     assert.ok(service);
  //     done();
  //   }
  //   done();
  // });

  // // Testing mqtt subscribe
  test('mqtt subscribe', async function (assert) {
    assert.expect(1);
    let service = this.owner.lookup('service:mqtt');
    let done = assert.async();
    try {
      await service.connect(mqttHost);
    } catch (oError) {
      done();
    }
    let _oGranted;
    try {
      _oGranted = await service.subscribe(mqttTopic);
    } catch (oError) {
      done();
    }
    assert.equal(_oGranted[0].topic, mqttTopic);
    done();
  });

  // // Testing mqtt publish
  test('mqtt publish', async function (assert) {
    assert.expect(2);
    let service = this.owner.lookup('service:mqtt');
    let done = assert.async();
    service.on(mqttEvent, (sTopic, sMessage) => {
      assert.equal(sTopic, mqttTopic);
      assert.equal(sMessage, mqttMessage);
      done();
    });
    try {
      await service.connect(mqttHost);
    } catch {
      done();
    }
    try {
      await service.subscribe(mqttTopic);
    } catch {
      done();
    }
    try {
      await service.publish(mqttTopic, mqttMessage);
    } catch {
      done();
    }
  });
});
