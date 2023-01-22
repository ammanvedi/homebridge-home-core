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

enum PictureMode {
  Dynamic = 'Dynamic',
  Standard = 'Standard',
  Natural = 'Natural',
  Movie = 'Movie'
}

enum SwitchValue {
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

export type CapabilityStatusResponse = ComponentStatus;