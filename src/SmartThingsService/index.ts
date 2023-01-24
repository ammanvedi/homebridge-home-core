import {CapabilityStatusResponse, Command, CommandResponse, DevicesResponse} from './types';
import axios from 'axios';
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

  async sendDeviceCommand(deviceId: string, command: Command): Promise<Readonly<CommandResponse>> {
    return this.post(`${this.apiBase}/devices/${deviceId}/commands`, JSON.stringify(command));
  }

  async get<ResponseType>(url: string): Promise<Readonly<ResponseType>> {
    return (await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    })).data as Readonly<ResponseType>;

  }

  async post<ResponseType>(url: string, body: string): Promise<Readonly<ResponseType>> {
    return (await axios.post(url, {
      method: 'post',
      body,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    })).data as Readonly<ResponseType>;

  }
}
