export type CapabilityReference = {
  id: string;
  version: number;
};

export type DeviceComponent = {
  id: string;
  label: string;
  capabilities: CapabilityReference[];
};

export type DevicesResponse = {
  items: {
    deviceId: string;
    name: string;
    components: DeviceComponent[];
  }[];
};

export enum PictureMode {
  Dynamic = 'Dynamic',
  Standard = 'Standard',
  Natural = 'Natural',
  Movie = 'Movie'
}

export enum SwitchValue {
  on = 'on',
  off = 'off'
}

export type PictureModeStatus = {
  pictureMode: {
    value: PictureMode;

  };
};

export type SwitchStatus = {
  switch: {
    value: SwitchValue;
  };
};

export type AudioVolumeStatus = {
  volume: {
    value: number;
  };
};

export type ComponentStatus =
  | PictureModeStatus
  | SwitchStatus
  | AudioVolumeStatus;

export type DeviceStatusResponse = {
  components: Record<string, Record<string, ComponentStatus>>;
};

export type Command = {
  component: string;
  capability: string;
  command: string;
  arguments: any[];
};

export type CommandBody = {
  commands: Command[];
};

export type CommandResponse = {
  results: {id: string; status: string}[];
};

export type CapabilityStatusResponse = ComponentStatus;