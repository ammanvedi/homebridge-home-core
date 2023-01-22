import {HomeCorePlatform} from './HomeCorePlatform';
import {PlatformAccessory} from 'homebridge';

type X = {

};

export interface AccessoryBuilderImpl {}

export type AccessoryBuilder = new (
  platform: HomeCorePlatform,
  accessory: PlatformAccessory,
) => AccessoryBuilderImpl;

