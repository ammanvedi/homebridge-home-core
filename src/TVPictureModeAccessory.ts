import {PlatformAccessory, Service} from 'homebridge';

import {HomeCorePlatform} from './HomeCorePlatform';
import {AccessoryBuilderImpl} from './types';
import {TV_MANUFACTURER, TV_NAME} from './settings';
import {PictureMode} from './SmartThingsService/types';

export class TVPictureModeAccessory implements AccessoryBuilderImpl {

  private readonly PICTURE_MODE_CAPABILITY = 'custom.picturemode';

  private;

  service: Service;
  constructor(
    private readonly platform: HomeCorePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, TV_MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, TV_NAME)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.UUID);

    this.service = this.accessory.getService(this.platform.Service.Lightbulb)
      || this.accessory.addService(this.platform.Service.Lightbulb);

    this.service.setCharacteristic(this.platform.Characteristic.Name, 'TV Brightness');


    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onGet(() => {
        return this.service.getCharacteristic(this.platform.Characteristic.On).value;
      })
      .onSet((newValue) => {
        this.platform.log.info('set On => setNewValue: ' + newValue);
        this.service.updateCharacteristic(this.platform.Characteristic.On, newValue);
      });

    this.service.getCharacteristic(this.platform.Characteristic.Brightness)
      .onGet(() => {
        return this.service.getCharacteristic(this.platform.Characteristic.Brightness).value;
      })
      .onSet(async (newValue) => {
        try {
          const command = {
            'component': 'main',
            'capability': 'custom.picturemode',
            'command': 'setPictureMode',
            'arguments': [
              this.getPictureModeFromBrightnessSetting(newValue as number),
            ],
          };
          this.platform.log.error('sending to device', this.accessory.context.deviceId);
          this.platform.log.error('sending to device', JSON.stringify(command));

          await this.platform.stService.sendDeviceCommand(this.accessory.context.deviceId, command);
          this.platform.log.info('set Brightness => setNewValue: ' + newValue);
          this.service.updateCharacteristic(this.platform.Characteristic.Brightness, newValue);
        } catch (e) {
          this.platform.log.info('Error setting brightness/picture mode' + e);
        }
      });

    this.startStateReconciler();

  }

  getPictureModeFromBrightnessSetting(brightness: number): PictureMode {
    if(brightness < 25) {
      return PictureMode.Natural;
    }

    if(brightness < 50) {
      return PictureMode.Movie;
    }

    if(brightness < 75) {
      return PictureMode.Standard;
    }

    return PictureMode.Dynamic;
  }

  getBrightnessSettingFromPictureMode(pictureMode: PictureMode): number {
    switch(pictureMode) {
      case PictureMode.Natural:
        return 25;
      case PictureMode.Movie:
        return 50;
      case PictureMode.Standard:
        return 75;
      case PictureMode.Dynamic:
        return 100;
    }
  }

  startStateReconciler() {
    setInterval(() => {

      this.platform.stService.getDeviceCapabilityStatus(
        this.accessory.context.deviceId,
        this.accessory.context.component,
        this.PICTURE_MODE_CAPABILITY,
      ).then(response => {
        if('pictureMode' in response) {
          this.service.updateCharacteristic(
            this.platform.Characteristic.Brightness,
            this.getBrightnessSettingFromPictureMode(response.pictureMode.value),
          );
        }
      });



    }, 10000);
  }

}
