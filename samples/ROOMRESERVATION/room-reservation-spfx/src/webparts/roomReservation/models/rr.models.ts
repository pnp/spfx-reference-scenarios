import { DateTime } from "luxon";

export interface IConfig {
  locations: ILocation[];
  meetings: IMeeting[];
}

export class Config implements IConfig {
  constructor(
    public locations: ILocation[] = [],
    public meetings: IMeeting[] = []
  ) { }
}

export interface ILocation {
  locationId: number;
  displayName: string;
  buildings: IBuilding[];
}

export class Location implements ILocation {
  constructor(
    public locationId: number = 0,
    public displayName: string = "",
    public buildings: IBuilding[] = [],
  ) { }
}

export interface IBuilding {
  buildingId: number;
  displayName: string;
  address: string;
  city: string;
  state: string;
  postalcode: string;
  country: string;
  phone: string;
  rooms: IRoom[];
}

export class Building implements IBuilding {
  constructor(
    public buildingId: number = null,
    public displayName: string = "",
    public address: string = "",
    public city: string = "",
    public state: string = "",
    public postalcode: string = "",
    public country: string = "",
    public phone: string = "",
    public rooms: IRoom[] = []
  ) { }
}


export interface IRoom {
  roomId: number;
  displayName: string;
  maxOccupancy: number;
  imagePath: string;
}

export class Room implements IRoom {
  constructor(
    public roomId: number = null,
    public displayName: string = "",
    public maxOccupancy: number = 0,
    public imagePath: string = ""
  ) { }
}

export interface IRoomResults extends IRoom {
  locationId: number;
  buildingId: number;
  buildingName: string;
}

export class RoomResult implements IRoomResults {
  constructor(
    public locationId: number = null,
    public buildingId: number = null,
    public buildingName: string = "",
    public roomId: number = null,
    public displayName: string = "",
    public maxOccupancy: number = 0,
    public imagePath: string = ""
  ) { }
}

export interface IMeeting {
  meetingId: number;
  subject: string;
  startTime: DateTime;
  endTime: DateTime;
  displayTime: string;
  locationId: number;
  buildingId: number;
  roomId?: number;
  roomName?: string;
  attendees: number;
}

export class Meeting implements IMeeting {
  constructor(
    public meetingId: number = null,
    public subject: string = "",
    public startTime: DateTime = DateTime.now(),
    public endTime: DateTime = DateTime.now(),
    public displayTime: string = "",
    public locationId: number = null,
    public buildingId: number = null,
    public roomId: number = null,
    public roomName: string = "",
    public attendees: number,

  ) { }
}

export interface IMeetingResult extends IMeeting {
  buildingDisplayName: string;
  buildingAddress: string;
  buildingCity: string;
  buildingState: string;
  buildingPostalCode: string;
  buildingCountry: string;
  buildingPhone: string;
}

export class MeetingResult implements IMeetingResult {
  constructor(
    public meetingId: number = null,
    public subject: string = "",
    public startTime: DateTime = DateTime.now(),
    public endTime: DateTime = DateTime.now(),
    public displayTime: string = "",
    public locationId: number = null,
    public buildingId: number = null,
    public buildingDisplayName: string = "",
    public buildingAddress: string = "",
    public buildingCity: string = "",
    public buildingState: string = "",
    public buildingPostalCode: string = "",
    public buildingCountry: string = "",
    public buildingPhone: string = "",
    public roomId: number = null,
    public roomName: string = "",
    public attendees: number,

  ) { }
}

