import { Logger, LogLevel } from "@pnp/logging";
import { includes, sortBy } from "lodash";
import { IConfig, IMeeting } from "../models/rr.models";
import { DateTime } from "luxon";

export interface IRoomReservationService {

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





}

export const rr = new RoomReservationService();