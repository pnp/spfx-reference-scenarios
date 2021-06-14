import { Logger, LogLevel } from "@pnp/logging";

import includes from "lodash/includes";
import sortBy from "lodash/sortBy";
import filter from "lodash/filter";
import forEach from "lodash/forEach";
import remove from "lodash/remove";

import { IBuilding, IConfig, ILocation, IMeeting, IRoom, IRoomResults, RoomResult } from "../models/rr.models";
import { DateTime } from "luxon";

export interface IRoomReservationService {
  Ready: boolean;
  Locale: string;
  Config: IConfig;
  Meetings: IMeeting[];
  Init(locale: string): Promise<void>;
  GetAvailableRooms(startTime: DateTime, endTime: DateTime, attendeeCount: number): IRoomResults[];
}

export class RoomReservationService implements IRoomReservationService {
  private LOG_SOURCE: string = "🔶 RoomReservationService";
  private _ready: boolean = false;
  private _currentConfig: IConfig = null;
  private _meetings: IMeeting[] = [];
  private _locale: string = "us";

  constructor() {
  }

  public get Ready(): boolean {
    return this._ready;
  }

  public get Locale(): string {
    return this._locale;
  }

  public get Config(): IConfig {
    return this._currentConfig;
  }

  public get Meetings(): IMeeting[] {
    return this._meetings;
  }

  public async Init(locale: string): Promise<void> {
    try {
      this._locale = locale.substr(0, 2);
      await this._getConfig();
      await this._getMeetings();
      this._ready = true;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (init) - ${err.message}`, LogLevel.Error);
    }
  }

  private async _getConfig(): Promise<void> {
    try {
      this._currentConfig = require("../mocks/config.json");
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_getConfig) - ${err} - `, LogLevel.Error);
    }
  }

  private _getMeetings() {
    try {
      this._currentConfig.meetings.map((m) => {
        m.startTime = DateTime.fromFormat(m.startTime.toString(), "D t").setLocale(rr.Locale);
        m.endTime = DateTime.fromFormat(m.endTime.toString(), "D t").setLocale(rr.Locale);

        if (m.startTime.toISODate == m.endTime.toISODate) {
          let startTime: string = m.startTime.toLocaleString(DateTime.TIME_SIMPLE);
          let endTime: string = m.endTime.toLocaleString(DateTime.TIME_SIMPLE);

          if (includes(startTime, ":00")) {
            startTime = startTime.replace(":00", "");
          }
          if (includes(endTime, ":00")) {
            endTime = endTime.replace(":00", "");
          }
          m.displayTime = `${m.startTime.toLocaleString(DateTime.DATE_MED)}  ${startTime}-${endTime}`;
        } else {
          m.displayTime = `${m.startTime.toLocaleString(DateTime.DATETIME_MED)}-${m.endTime.toLocaleString(DateTime.DATETIME_MED)}`;
        }
      });
      this._meetings = sortBy(this._currentConfig.meetings, "startTime");
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_getMeetings) - ${err} - `, LogLevel.Error);
    }
  }

  public GetAvailableRooms(startTime: DateTime, endTime: DateTime, attendeeCount: number): IRoomResults[] {
    let retVal: IRoomResults[] = [];
    try {
      //Get rooms that meet size requirement
      forEach(this._currentConfig.locations, (location: ILocation) => {
        forEach(location.buildings, (building: IBuilding) => {
          forEach(building.rooms, (room: IRoom) => {
            if (room.maxOccupancy >= attendeeCount) {
              retVal.push(new RoomResult(location.locationId, building.buildingId, room.roomId, room.displayName, room.maxOccupancy, room.imagePath));
            }
          });
        });
      });
      //Remove rooms already reserved for time period
      const notAvailable = filter(this._meetings, (m: IMeeting) => {
        return (startTime <= m.endTime && endTime >= m.startTime);
      });
      if (notAvailable.length > 0) {
        forEach(notAvailable, (o: IMeeting) => {
          remove(retVal, { roomId: o.roomId });
        });
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetAvailableRooms) - ${err} - `, LogLevel.Error);
    }
    return retVal;
  }
}

export const rr = new RoomReservationService();