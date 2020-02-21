import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | mqtt', function(hooks) {

  let mqttHost = 'wss://test.mosquitto.org:8081';
  let mqttTopic = 'presence';
  let mqttMessage = 'Hello';
  let mqttEvent = 'mqtt-message';

  setupTest(hooks);

  // Testing mqttjs import
  test('it exists', function (assert){
    let service = this.owner.lookup('service:mqtt');
    assert.ok(service);
  });

  // Testing mqtt connect
  test('mqtt connect', function(assert){
    let service = this.owner.lookup('service:mqtt');
    let done = assert.async();
    service.connect(mqttHost).then(function(){
      assert.ok(service);
      done();
    }).catch(function(){
      done();
    });
  });

  // Testing mqtt subscribe
  test('mqtt subscribe', function(assert){
    let service = this.owner.lookup('service:mqtt');
    let done = assert.async();
    service.connect(mqttHost).then(()=>{
      service.subscribe(mqttTopic).then((oGranted)=>{
        assert.equal(oGranted[0].topic, mqttTopic);
        done();
      }).catch(()=>{
        done();
      });
    }).catch(()=>{
      done();
    });
  });

  // Testing mqtt publish
  test('mqtt publish', function(assert){
    let service = this.owner.lookup('service:mqtt');
    let done = assert.async();
    service.connect(mqttHost).then(()=>{
      service.subscribe(mqttTopic).then(()=>{
        service.publish(mqttTopic, mqttMessage).then(()=>{
          service.on(mqttEvent, (sTopic, sMessage)=>{
            assert.equal(sTopic, mqttTopic);
            assert.equal(sMessage, mqttMessage);
            done();
          });
        }).catch(()=>{
          done();
        });
      }).catch(()=>{
        done();
      });
    }).catch(()=>{
      done();
    });
  });

});
