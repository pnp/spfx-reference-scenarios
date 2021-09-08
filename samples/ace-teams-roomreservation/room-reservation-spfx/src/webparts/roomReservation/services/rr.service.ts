import { Logger, LogLevel } from "@pnp/logging";

import { Web } from "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items/list";
import "@pnp/sp/files";
import "@pnp/sp/folders";

import includes from "lodash-es/includes";
import filter from "lodash-es/filter";
import forEach from "lodash-es/forEach";
import remove from "lodash-es/remove";
import { find } from "@microsoft/sp-lodash-subset";
import { cloneDeep } from "@microsoft/sp-lodash-subset";
import { DateTime } from "luxon";

import { IBuilding, IConfig, ILocation, IMeeting, IMeetingResult, IRoom, IRoomResults, MeetingResult, RoomResult } from "../models/rr.models";

export interface IRoomReservationService {
  Ready: boolean;
  Locale: string;
  Config: IConfig;
  HandleExecuteDeepLink: (meetingUrl: string) => void;
  Init(locale: string): Promise<void>;
  GetAvailableRooms(startTime: DateTime, endTime: DateTime, attendeeCount: number): IRoomResults[];
  GetAllRooms(): IRoomResults[];
  GetMeetings(): IMeetingResult[];
  UpdateConfig(config?: IConfig, newFile?: boolean): Promise<boolean>;
  GetMeetingDisplayTime(meetingStart: DateTime, meetingEnd: DateTime);
  ExecuteDeepLink(meetingUrl: string);
  GetRoomDetailsForMeeting(room: IRoomResults, meeting: IMeetingResult);
}

export class RoomReservationService implements IRoomReservationService {
  private LOG_SOURCE: string = "🔶 RoomReservationService";

  private ROOT_WEB: string = document.location.origin;
  private CONFIG_FOLDER: string = "RoomReservation";
  private CONFIG_FILE_NAME: string = "roomresconfig.json";
  private _executeDeepLink: (meetingUrl: string) => void;

  private _ready: boolean = false;
  private _currentConfig: IConfig = null;
  private _meetings: IMeetingResult[] = [];
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

  public set HandleExecuteDeepLink(value: (meetingUrl: string) => void) {
    this._executeDeepLink = value;
  }

  public async Init(locale: string): Promise<void> {
    try {
      this._locale = locale.substr(0, 2);
      await this._getConfig();
      this._ready = true;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (init) - ${err.message}`, LogLevel.Error);
    }
  }

  private async _getConfig(): Promise<void> {
    try {
      let newFile: boolean = false;

      try {
        const web = Web(this.ROOT_WEB);
        this._currentConfig = await web.getFileByServerRelativeUrl(`/SiteAssets/${this.CONFIG_FOLDER}/${this.CONFIG_FILE_NAME}`).getJSON();
      } catch (e) {
        //Do Nothing as it'll just create the new config.
      }


      if (this._currentConfig == undefined) {
        newFile = true;
        this._currentConfig = require("../mocks/config.json");
        this.UpdateConfig(undefined, newFile);
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_getConfig) - ${err} - `, LogLevel.Error);
    }
  }

  public async UpdateConfig(config?: IConfig, newFile: boolean = false): Promise<boolean> {
    let retVal: boolean = false;
    try {
      if (config != undefined) {
        this._currentConfig = config;
      }
      const web = Web(this.ROOT_WEB);
      let configFile;

      if (newFile) {
        //Validate folder
        try {
          const folder = await web.getFolderByServerRelativeUrl(`/SiteAssets/${this.CONFIG_FOLDER}`)();
        } catch (e) {
          const folder2 = await web.getFolderByServerRelativeUrl(`/SiteAssets`).addSubFolderUsingPath(`${this.CONFIG_FOLDER}`);
        }
        configFile = await web.getFolderByServerRelativeUrl(`/SiteAssets/${this.CONFIG_FOLDER}`).files.addUsingPath(`${this.CONFIG_FILE_NAME}`, JSON.stringify(this._currentConfig));
      } else {
        configFile = await web.getFileByServerRelativeUrl(`/SiteAssets/${this.CONFIG_FOLDER}/${this.CONFIG_FILE_NAME}`).setContent(JSON.stringify(this._currentConfig));
      }
      if (configFile.data)
        retVal = true;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (UpdateConfig) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  public GetAllRooms(): IRoomResults[] {
    let retVal: IRoomResults[] = [];
    try {
      //Get rooms that meet size requirement
      forEach(this._currentConfig.locations, (location: ILocation) => {
        forEach(location.buildings, (building: IBuilding) => {
          forEach(building.rooms, (room: IRoom) => {
            retVal.push(new RoomResult(location.locationId, building.buildingId, building.displayName, room.roomId, room.displayName, room.maxOccupancy, room.imagePath));
          });
        });
      });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetAllRooms) - ${err} - `, LogLevel.Error);
    }
    return retVal;
  }

  public GetAvailableRooms(startTime: DateTime, endTime: DateTime, attendeeCount: number): IRoomResults[] {
    let retVal: IRoomResults[] = [];
    try {
      //Get rooms that meet size requirement
      forEach(this._currentConfig.locations, (location: ILocation) => {
        forEach(location.buildings, (building: IBuilding) => {
          forEach(building.rooms, (room: IRoom) => {
            if (room.maxOccupancy >= attendeeCount) {
              retVal.push(new RoomResult(location.locationId, building.buildingId, building.displayName, room.roomId, room.displayName, room.maxOccupancy, room.imagePath));
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
  public GetRoomDetailsForMeeting(room: IRoomResults, meeting: IMeetingResult): IMeetingResult {
    let retVal: IMeetingResult;
    try {

      const location = find(this._currentConfig.locations, { locationId: room.locationId });
      const building = find(location.buildings, { buildingId: room.buildingId });
      if (building) {

        retVal = cloneDeep(meeting);

        retVal.buildingLat = building.latitude;
        retVal.buildingLong = building.longitude;
        retVal.buildingDisplayName = building.displayName;
        retVal.buildingAddress = building.address;
        retVal.buildingCity = building.city;
        retVal.buildingState = building.state;
        retVal.buildingPostalCode = building.postalcode;
        retVal.buildingCountry = building.country;
        retVal.buildingPhone = building.phone;
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetRoomDetailsForMeeting) - ${err} - `, LogLevel.Error);
    }
    return retVal;
  }
  public GetMeetingDisplayTime(start: DateTime, end: DateTime): string {
    let retVal: string = "";
    try {
      if (start.toISODate == end.toISODate) {
        let startTime: string = start.toLocaleString(DateTime.TIME_SIMPLE);
        let endTime: string = end.toLocaleString(DateTime.TIME_SIMPLE);

        if (includes(startTime, ":00")) {
          startTime = startTime.replace(":00", "");
        }
        if (includes(endTime, ":00")) {
          endTime = endTime.replace(":00", "");
        }
        retVal = `${start.toLocaleString(DateTime.DATE_SHORT)}  ${startTime}-${endTime}`;
      } else {
        retVal = `${start.toLocaleString(DateTime.DATETIME_SHORT)}-${end.toLocaleString(DateTime.DATETIME_SHORT)}`;
      }

    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetMeetingDisplayTime) - ${err} - `, LogLevel.Error);
    }
    return retVal;
  }

  public GetMeetings(): IMeetingResult[] {
    let retVal: IMeetingResult[] = [];
    try {
      const now: DateTime = DateTime.now().setLocale(this._locale);
      forEach(this._currentConfig.meetings, (meeting) => {
        const start: DateTime = DateTime.fromISO(meeting.startTime.toString()).setLocale(this._locale);
        const end: DateTime = DateTime.fromISO(meeting.endTime.toString()).setLocale(this._locale);

        //const start: DateTime = DateTime.fromFormat(meeting.startTime.toString(), "D t").setLocale(this._locale);
        //const end: DateTime = DateTime.fromFormat(meeting.endTime.toString(), "D t").setLocale(this._locale);
        if (start.toISO() > now.toISO()) {
          //Format the display of the meeting time
          const displayTime = this.GetMeetingDisplayTime(start, end);

          const building: IBuilding = this._currentConfig.locations[meeting.locationId].buildings[meeting.buildingId];
          const room: IRoom = building.rooms[meeting.roomId];

          let mr = new MeetingResult(
            building.displayName,
            building.address,
            building.city,
            building.state,
            building.postalcode,
            building.country,
            building.latitude,
            building.longitude,
            building.phone,
            meeting.meetingId,
            meeting.subject,
            meeting.startTime,
            meeting.endTime,
            displayTime,
            meeting.locationId,
            building.buildingId,
            -1,
            "",
            meeting.attendees);

          if (room) {
            mr.roomId = room.roomId;
            mr.roomName = room.displayName;
          }

          retVal.push(mr);
        }
      });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetMeetings) - ${err} - `, LogLevel.Error);
    }
    return retVal;
  }

  public ExecuteDeepLink(meetingUrl: string): void {
    if (typeof this._executeDeepLink == "function") {
      this._executeDeepLink(meetingUrl);
    }
  }
}

export const rr = new RoomReservationService();