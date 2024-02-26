import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
  Characteristic } from 'homebridge';

import {PLATFORM_NAME, PLUGIN_NAME, TV_NAME} from './settings';
import {SmartThingsService} from './TVControls/SmartThingsService';
import {AccessoryBuilder} from './types';
import {TVPictureModeAccessory} from './TVControls/TVPictureModeAccessory';
import {YeelightCubeMatrixService} from './MatrixControls/YeelightCubeMatrixService';
import {StatusCubeAccessory} from './MatrixControls/StatusCubeAccessory';

declare module 'homebridge' {
  export interface PlatformConfig {
    smartThingsAPIKey: string;
    statusCubeIP: string;
  }
}

export class HomeCorePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  public readonly accessories: PlatformAccessory[] = [];

  public readonly smartThingsService: SmartThingsService;
  public readonly yeelightCubeService: YeelightCubeMatrixService;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.error('Finished initializing platform:', JSON.stringify(this.config));
    this.smartThingsService = new SmartThingsService(this.config.smartThingsAPIKey);
    this.yeelightCubeService = new YeelightCubeMatrixService(this.log);

    this.api.on('didFinishLaunching', () => {
      void this.discoverDevices();
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
    const devices = await this.smartThingsService.getDevices();

    const tv = devices.items.find(d => d.name === TV_NAME);

    if(!tv) {
      return;
    }

    const tvContext = {deviceId: tv.deviceId, component: 'main'};

    this.buildAccessory(
      this.api.hap.uuid.generate(`${tv.deviceId}-tv-picture-mode`),
      'TV Picture Mode',
      TVPictureModeAccessory,
      tvContext,
    );

  }

  async discoverStatusCubes() {

    this.buildAccessory(
      this.api.hap.uuid.generate('status-cube'),
      'Status Cube',
      StatusCubeAccessory,
      {
        host: this.config.statusCubeIP,
      },
    );
  }

  buildAccessory(
    uuid: string,
    displayName: string,
    Builder: AccessoryBuilder,
    context: Record<string, unknown>,
  ) {
    const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

    if (existingAccessory) {
      this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
      new Builder(this, existingAccessory);
    } else {
      this.log.info('Adding new accessory:', displayName);
      const accessory = new this.api.platformAccessory(displayName, uuid);
      accessory.context = context;
      new Builder(this, accessory);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
  }

  async discoverDevices() {
    try {

      await this.discoverTelevision();
      await this.discoverStatusCubes();
    } catch (e) {
      this.log.error('Error discovering devices:', e);
    }
  }
}
