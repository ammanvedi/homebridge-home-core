import axios from 'axios';

const HOME_TO_STATION_WALK_TIME_SECS = 60 * 6;

const HOME_STOP_POINT = '910GSTHALL';

const TFL_BASE_URL = 'https://api.tfl.gov.uk';

const MAX_JOURNEYS_TO_ANALYSE = 8;

const REFRESH_INTERVAL_MS = 61 * 1000;

const getArrivalsUrl = () => {
  return `${TFL_BASE_URL}/StopPoint/${HOME_STOP_POINT}/arrivals`;
};

const getVehicleArrivalsUrl = (vehicleId: string) => {
  return `${TFL_BASE_URL}/Vehicle/${vehicleId}/Arrivals`;
};

type StationArrival = {
  id: string;
  vehicleId: string;
  expectedArrival: string;
  direction: 'inbound' | 'outbound';
  destinationNaptanId: string;
};

type VehicleArrival = {
  naptanId: string;
  expectedArrival: string;
};

const STATIONS_TO_AVOID = [
  '910GWEALING',
  '910GHANWELL',
];

export enum TrainSpeedType {
  FAST = 'fast',
  SLOW = 'slow',
}

type Train = {
  id: string;
  arrivalTimestampUTCSecs: number;
  leaveFromHomeTimestampUTCSecs: number;
  leaveFromHomeMinsFromNowRounded: number;
  speedType: TrainSpeedType;
};

export class TravelPredictor {

  httpClient = axios.create();

  intervalId: NodeJS.Timeout | null = null;

  async getStationArrivals(): Promise<StationArrival[]> {
    const response = await this.httpClient.get<StationArrival[]>(getArrivalsUrl());
    console.log(JSON.stringify(response.data.sort(
      (a, b) => new Date(a.expectedArrival).getTime() - new Date(b.expectedArrival).getTime(),
    )));
    return response.data.sort(
      (a, b) => new Date(a.expectedArrival).getTime() - new Date(b.expectedArrival).getTime(),
    );
  }

  async getVehicleArrivals(vehicleId: string): Promise<VehicleArrival[]> {
    const response = await this.httpClient.get(getVehicleArrivalsUrl(vehicleId));
    return response.data;
  }

  async getTrainsIntoLondon(): Promise<Train[]> {

    const arrivals = await this.getStationArrivals();
    // We only carre about journeys going into london
    const inboundJourneys = arrivals.filter(arrival => arrival.direction === 'inbound').slice(0, MAX_JOURNEYS_TO_ANALYSE);
    // for each of these check which ones are fast trains

    const result: Train[] = [];

    for (let i = 0; i < inboundJourneys.length; i++) {
      const isFast = await this.isFastTrain(inboundJourneys[i].vehicleId);

      const arrivalTimestampUTCSecs = new Date(inboundJourneys[i].expectedArrival).getTime() / 1000;

      const leaveFromHomeTimestampUTCSecs = arrivalTimestampUTCSecs - HOME_TO_STATION_WALK_TIME_SECS;

      const leaveFromHomeMinsFromNowRounded = Math.floor((leaveFromHomeTimestampUTCSecs - Date.now() / 1000) / 60);

      if (leaveFromHomeMinsFromNowRounded < 0) {
        continue;
      }

      result.push({
        id: inboundJourneys[i].id,
        arrivalTimestampUTCSecs,
        leaveFromHomeTimestampUTCSecs,
        leaveFromHomeMinsFromNowRounded,
        speedType: isFast ? TrainSpeedType.FAST : TrainSpeedType.SLOW,
      });
    }

    return result;
  }

  async isFastTrain(vehicleId: string) {
    const arrivals = await this.getVehicleArrivals(vehicleId);
    return !arrivals.some(a => STATIONS_TO_AVOID.includes(a.naptanId));
  }

  start(callback: (result: Train[]) => void) {

    this.intervalId = setInterval(() => {
      this.getTrainsIntoLondon().then(callback);
    }, REFRESH_INTERVAL_MS);
  }

  stop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }
  }

}