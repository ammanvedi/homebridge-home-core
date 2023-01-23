import {HomeCorePlatform} from './HomeCorePlatform';
import {PlatformAccessory} from 'homebridge';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AccessoryBuilderImpl {}

export type AccessoryBuilder = new (
  platform: HomeCorePlatform,
  accessory: PlatformAccessory,
) => AccessoryBuilderImpl;

