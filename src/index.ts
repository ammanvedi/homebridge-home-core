import { API } from 'homebridge';

import { PLATFORM_NAME } from './settings';
import { HomeCorePlatform } from './HomeCorePlatform';

/**
 * This method registers the platform with Homebridge
 */
export = (api: API) => {
  api.registerPlatform(PLATFORM_NAME, HomeCorePlatform);
};
