import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { HomeCorePlatform } from './HomeCorePlatform';
import {AccessoryBuilderImpl} from './types';

export class TVVolumeAccessory implements AccessoryBuilderImpl {

  constructor(
    private readonly platform: HomeCorePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

  }


}
