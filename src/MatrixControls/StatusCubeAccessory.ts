import {AccessoryBuilderImpl} from '../types';
import {PlatformAccessory, Service} from 'homebridge';
import {HomeCorePlatform} from '../HomeCorePlatform';
import {YeelightCubeMatrixService} from './YeelightCubeMatrixService';

export class StatusCubeAccessory implements AccessoryBuilderImpl {
  service: Service;

  constructor(
    private readonly platform: HomeCorePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    const [host, port] = this.accessory.context.host.split(':');

    this.service = this.accessory.getService(this.platform.Service.Lightbulb)
      || this.accessory.addService(this.platform.Service.Lightbulb);

    this.service.setCharacteristic(this.platform.Characteristic.Name, 'Status Light');


    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onGet(() => {
        return this.service.getCharacteristic(this.platform.Characteristic.On).value;
      })
      .onSet((newValue) => {

        if(newValue) {
          this.platform.yeelightCubeService.deviceOn();
        } else {
          this.platform.yeelightCubeService.deviceOff();
        }

        this.platform.log.info('set On => setNewValue: ' + newValue);
        this.service.updateCharacteristic(this.platform.Characteristic.On, newValue);
      });

    platform.log.info('Cube created');

    void platform.yeelightCubeService.findDevice(host, parseInt(port, 10)).then(() => {
      console.log('Status Cube Found');
    });

  }
}