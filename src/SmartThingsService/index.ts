import {CapabilityStatusResponse, DevicesResponse} from './types';
import fetch from 'node-fetch';

export class SmartThingsService {

  private readonly apiBase: string = 'https://api.smartthings.com/v1';

  constructor(private readonly apiKey: string) {
  }

  async getDevices(): Promise<Readonly<DevicesResponse>> {
    return this.get(`${this.apiBase}/devices`);
  }

  async getDeviceCapabilityStatus(
    deviceId: string,
    component: string,
    capability: string,
  ): Promise<Readonly<CapabilityStatusResponse>> {
    return this.get(`${this.apiBase}/devices/${deviceId}/components/${component}/capabilities/${capability}/status`);
  }

  async get<ResponseType>(url: string): Promise<Readonly<ResponseType>> {
    const result = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    return await result.json() as Readonly<ResponseType>;
  }
}
