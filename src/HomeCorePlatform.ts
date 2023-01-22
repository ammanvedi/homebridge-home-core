import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
  Characteristic } from 'homebridge';

import {PLATFORM_NAME, PLUGIN_NAME, TV_NAME} from './settings';
import {SmartThingsService} from './SmartThingsService';
import {AccessoryBuilder} from './types';
import {TVPictureModeAccessory} from './TVPictureModeAccessory';
import {TVPowerAccessory} from './TVPowerAccessory';
import {TVVolumeAccessory} from './TVVolumeAccessory';

declare module 'homebridge' {
  export interface PlatformConfig {
    smartThingsAPIKey: string;
  }
}

export class HomeCorePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  public readonly accessories: PlatformAccessory[] = [];

  private readonly stService = new SmartThingsService(this.config.smartThingsAPIKey);

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      this.discoverDevices();
    });
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);

    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory);
  }

  async discoverTelevision() {
    const devices = await this.stService.getDevices();

    const tv = devices.items.find(d => d.name === TV_NAME);

    if(!tv) {
      return;
    }

    this.buildAccessory(
      this.api.hap.uuid.generate(`${tv.deviceId}-tv-picture-mode`),
      'TV Picture Mode',
      TVPictureModeAccessory,
    );

    this.buildAccessory(
      this.api.hap.uuid.generate(`${tv.deviceId}-tv-power`),
      'TV Power',
      TVPowerAccessory,
    );

    this.buildAccessory(
      this.api.hap.uuid.generate(`${tv.deviceId}-tv-volume`),
      'TV Volume',
      TVVolumeAccessory,
    );

  }

  buildAccessory(
    uuid: string,
    displayName: string,
    Builder: AccessoryBuilder,
  ) {
    const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

    if (existingAccessory) {
      this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
      new Builder(this, existingAccessory);
    } else {
      this.log.info('Adding new accessory:', displayName);
      const accessory = new this.api.platformAccessory(displayName, uuid);
      new Builder(this, accessory);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
  }

  async discoverDevices() {
    await this.discoverTelevision();
  }
}
