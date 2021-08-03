import mqttjs from 'mqtt/dist/mqtt';
import MqttService from '../../../addon/services/mqtt.sample';

// generally mocking an external package
jest.mock('mqtt/dist/mqtt', () => ({
  connect: jest.fn(),
}));

describe('addon/services/mqtt', () => {
  describe('constructor', () => {
    test('should work as expected', () => {
      const service = new MqttService();
      expect(service.client).toBe(null);
      expect(service.connected).toBe(false);
      //** check if fConnecting is a promise */
      expect(service.fConnecting).toBeDefined();
      expect(typeof service.fConnecting).toBe('object');
      expect(service.fConnecting.then).toBeDefined();
      expect(typeof service.fConnecting.then).toBe('function');
      //** end check */
    });
  });

  describe('connect', () => {
    beforeEach(() => {
      /**
       * internally mocking the return value of `mqttjs.connect` function,
       * resetting the state before each test case
       */
      mqttjs.connect.mockReturnValue({
        on: jest.fn(),
      });
    });
    test('should work as expected', () => {
      const service = new MqttService();
      const retPromise = service.connect('myHost', 'myUsername', 'myPassword');
      //** check if retPromise is a promise */
      expect(retPromise).toBeDefined();
      expect(typeof retPromise).toBe('object');
      expect(retPromise.then).toBeDefined();
      expect(typeof retPromise.then).toBe('function');
      //** end check */
      expect(mqttjs.connect).toHaveBeenCalledWith('myHost', {
        username: 'myUsername',
        password: 'myPassword',
      });
      expect(service.client).toBeDefined();
      /**
       * expecting 7 calls to `service.client.on` function:
       * [message, connect, reconnect, error, disconnect, close, offline]
       */
      expect(service.client.on.mock.calls.length).toBe(7);
    });
  });
});
