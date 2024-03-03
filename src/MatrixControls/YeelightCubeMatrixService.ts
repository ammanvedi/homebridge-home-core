import {Device, Discovery} from 'yeelight-platform';
import {wait} from '../utils';
import {Logger} from 'homebridge';
import {TrainSpeedType, TravelPredictor} from './TravelPredictor';


function reverseArray<T>(arr: T[]): T[] {
  const reversedArray = [...arr].reverse();
  return reversedArray;
}


export class YeelightCubeMatrixService {

  static readonly COLOR_LIGHT_BLUE = 'aaaa';
  static readonly COLOR_GREEN = 'cccc';
  static readonly COLOR_RED = '0000';
  static readonly COLOR_DEEP_RED = 'gggg';
  static readonly COLOR_MAGENTA = 'hhhh';
  static readonly COLOR_PINK = '1111';
  static readonly COLOR_WASHED_GREEN = '9999';
  static readonly COLOR_OFF = 'AAAA';
  static readonly COLOR_DARK_BLUE = 'BBBB';
  static readonly COLOR_SWEET_GREEN = 'LLll';
  static readonly COLOR_YELLOW = '8888';
  static readonly COLOR_CERULEAN = 'DDDD';
  static readonly COLOR_POP_GREEN = 'MMMM';

  //static readonly COLOR_PRIMARY = 'ccc0';
  static readonly COLOR_PRIMARY = YeelightCubeMatrixService.COLOR_CERULEAN;
  static readonly COLOR_FAST = YeelightCubeMatrixService.COLOR_POP_GREEN;
  static readonly COLOR_SLOW = YeelightCubeMatrixService.COLOR_YELLOW;

  static readonly COLOR_SECONDARY = '0000';
  private device: Device | null = null;
  private commandId = 0;

  private readonly trainPredictor = new TravelPredictor();

  private static readonly DEFAULT_MATRIX_STATE = [
    YeelightCubeMatrixService.COLOR_PRIMARY, YeelightCubeMatrixService.COLOR_PRIMARY, YeelightCubeMatrixService.COLOR_PRIMARY, YeelightCubeMatrixService.COLOR_PRIMARY, YeelightCubeMatrixService.COLOR_PRIMARY,
    YeelightCubeMatrixService.COLOR_PRIMARY, YeelightCubeMatrixService.COLOR_PRIMARY, YeelightCubeMatrixService.COLOR_PRIMARY, YeelightCubeMatrixService.COLOR_PRIMARY, YeelightCubeMatrixService.COLOR_PRIMARY,
    YeelightCubeMatrixService.COLOR_PRIMARY, YeelightCubeMatrixService.COLOR_PRIMARY, YeelightCubeMatrixService.COLOR_PRIMARY, YeelightCubeMatrixService.COLOR_PRIMARY, YeelightCubeMatrixService.COLOR_PRIMARY,
    YeelightCubeMatrixService.COLOR_PRIMARY, YeelightCubeMatrixService.COLOR_PRIMARY, YeelightCubeMatrixService.COLOR_PRIMARY, YeelightCubeMatrixService.COLOR_PRIMARY, YeelightCubeMatrixService.COLOR_PRIMARY,
    YeelightCubeMatrixService.COLOR_PRIMARY, YeelightCubeMatrixService.COLOR_PRIMARY, YeelightCubeMatrixService.COLOR_PRIMARY, YeelightCubeMatrixService.COLOR_PRIMARY, YeelightCubeMatrixService.COLOR_PRIMARY,
  ];

  matrixState: Array<string> = [
    ...YeelightCubeMatrixService.DEFAULT_MATRIX_STATE,
  ];

  constructor(private readonly logger: Logger) {}


  flushMatrixStateToDevice() {
    console.log('flush', this.matrixState, reverseArray(this.matrixState));
    this.device.sendCommand({
      id: 1,
      method: 'update_leds',
      params: [
        reverseArray(this.matrixState).map((_ ) => _ ).join(''),
      ],
    });
  }

  setDots(dots: Array<string>) {
    const newState = [...dots];

    if(JSON.stringify(newState) === JSON.stringify(this.matrixState)) {
      this.logger.info('No change in matrix state, preventing update');
      return;
    }

    this.matrixState = newState;

    this.flushMatrixStateToDevice();
  }

  setDotToColor(x: 0 | 1 | 2 | 3 | 4 | 5, y: 0 | 1 | 2 | 3 | 4 | 5, color: string) {
    this.matrixState[x + y * 5] = color;
    this.flushMatrixStateToDevice();
  }

  getCommandId() {
    this.commandId = this.commandId + 1;
    return this.commandId;
  }

  async deviceOn() {
    await this.initialize();

    setTimeout(() => {
      this.trainPredictor.stop();
      this.trainPredictor.start(trains => {
        console.log(JSON.stringify(trains, null, 2));
        const newMatrixState = [...YeelightCubeMatrixService.DEFAULT_MATRIX_STATE];

        for (const train of trains) {
          const index = train.leaveFromHomeMinsFromNowRounded;
          if(newMatrixState[index]) {
            newMatrixState[index] =
              train.speedType === TrainSpeedType.FAST ? YeelightCubeMatrixService.COLOR_FAST : YeelightCubeMatrixService.COLOR_SLOW;
          }
        }

        this.setDots(newMatrixState);

      });
    }, 5 * 1000);
  }

  deviceOff() {
    void this.turnOff();
  }

  private turnOff() {
    this.device.sendCommand({
      id: this.getCommandId(),
      method: 'set_power',
      params: ['off', 'smooth', 500],
    });
  }

  private turnOn() {
    this.device.sendCommand({
      id: this.getCommandId(),
      method: 'set_power',
      params: ['on', 'smooth', 500],
    });
  }

  async initialize() {
    const w = wait(2000);

    console.log('Starting status cube initialization sequence...');

    this.turnOn();

    await w();


    this.device.sendCommand({
      id: this.getCommandId(),
      method: 'set_segment_rgb',
      params: [0, 0, 0, 0, 0, 0, 0],
    });

    await w();

    this.device.sendCommand({
      id: this.getCommandId(),
      method: 'set_scene',
      params: ['cf', 0, 0, '500,1,255,100,1000,1,16776960,70'],
    });

    await w();

    this.device.sendCommand({
      id: this.getCommandId(),
      method: 'stop_cf',
      params: [],
    });

    await w();
    this.turnOff();
    await w();
    this.turnOn();
    await w();
    this.flushMatrixStateToDevice();
  }

  findDevice(host: string, port: number): Promise<Device> {

    console.log('Finding status light...', host, port);

    const d = new Device({host, port});
    this.device = d;

    this.device.connect();

    this.device.on('deviceUpdate', (update) => {
      this.logger.info(update);
    });

    this.device.on('connected', () => {
      void this.initialize();
    });

    return Promise.resolve(d);
  }
}