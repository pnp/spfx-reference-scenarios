export enum PERSON_TYPE {
  LocGuest = 1,
  Employee
}

export enum CONFIG_TYPE {
  Personal = 1,
  Team
}
export enum HOUR_TYPE {
  WorkingHour = 1,
  ExtendedHour,
  NotWorking
}
let _hourList: IHour[] = [
  { hourId: 0, workingType: HOUR_TYPE.NotWorking },
  { hourId: 1, workingType: HOUR_TYPE.NotWorking },
  { hourId: 2, workingType: HOUR_TYPE.NotWorking },
  { hourId: 3, workingType: HOUR_TYPE.NotWorking },
  { hourId: 4, workingType: HOUR_TYPE.NotWorking },
  { hourId: 5, workingType: HOUR_TYPE.NotWorking },
  { hourId: 6, workingType: HOUR_TYPE.NotWorking },
  { hourId: 7, workingType: HOUR_TYPE.NotWorking },
  { hourId: 8, workingType: HOUR_TYPE.ExtendedHour },
  { hourId: 9, workingType: HOUR_TYPE.WorkingHour },
  { hourId: 10, workingType: HOUR_TYPE.WorkingHour },
  { hourId: 11, workingType: HOUR_TYPE.WorkingHour },
  { hourId: 12, workingType: HOUR_TYPE.WorkingHour },
  { hourId: 13, workingType: HOUR_TYPE.WorkingHour },
  { hourId: 14, workingType: HOUR_TYPE.WorkingHour },
  { hourId: 15, workingType: HOUR_TYPE.WorkingHour },
  { hourId: 16, workingType: HOUR_TYPE.WorkingHour },
  { hourId: 17, workingType: HOUR_TYPE.ExtendedHour },
  { hourId: 18, workingType: HOUR_TYPE.NotWorking },
  { hourId: 19, workingType: HOUR_TYPE.NotWorking },
  { hourId: 20, workingType: HOUR_TYPE.NotWorking },
  { hourId: 21, workingType: HOUR_TYPE.NotWorking },
  { hourId: 22, workingType: HOUR_TYPE.NotWorking },
  { hourId: 23, workingType: HOUR_TYPE.NotWorking },
];
let _dayList: IDay[] = [
  { dayId: 1, hours: _hourList },
  { dayId: 2, hours: _hourList },
  { dayId: 3, hours: _hourList },
  { dayId: 4, hours: _hourList },
  { dayId: 5, hours: _hourList },
  { dayId: 6, hours: _hourList },
  { dayId: 0, hours: _hourList },
];

export interface IPerson {
  personId: string;
  userPrincipal: string;
  personType: PERSON_TYPE;
  displayName: string;
  jobTitle: string;
  mail: string;
  photoUrl: string;
  schedule: ISchedule;
  windowsTimeZone: string;
  IANATimeZone: string;
  offset?: number;
  timeStyle?: string;
}

export class Person implements IPerson {
  constructor(
    public personId: string = "",
    public userPrincipal: string = "",
    public personType: PERSON_TYPE = null,
    public displayName: string = "",
    public jobTitle: string = null,
    public mail: string = null,
    public photoUrl: string = null,
    public windowsTimeZone: string = null,
    public IANATimeZone: string = null,
    public offset: number = 0,
    public schedule: ISchedule = new Schedule(),
    public timeStyle: string = null
  ) { }
}

export interface ITeam {
  teamId: string;
  teamName: string;
}

export class Team implements ITeam {
  constructor(
    public teamId: string = null,
    public teamName: string = null
  ) { }
}

export interface IWCView {
  viewId: string;
  viewName: string;
  members: string[];
}

export class WCView implements IWCView {
  constructor(
    public viewId: string = null,
    public viewName: string = null,
    public members: string[] = []
  ) { }
}

export interface IConfig {
  configType: CONFIG_TYPE;
  configPerson: IPerson;
  configTeam: ITeam;
  defaultViewId: string;
  members: IPerson[];
  views: IWCView[];
}

export class Config implements IConfig {
  constructor(
    public configType: CONFIG_TYPE = null,
    public configPerson: IPerson = null,
    public members: IPerson[] = [],
    public configTeam: ITeam = null,
    public defaultViewId: string = null,
    public views: IWCView[] = []
  ) { }
}

//TODO: Derek is there a first day of the week in the current locale.
export interface ISchedule {
  days: IDay[];
}
export class Schedule implements ISchedule {
  constructor(
    public days: IDay[] = [
      {
        dayId: 1, hours: [
          { hourId: 0, workingType: HOUR_TYPE.NotWorking },
          { hourId: 1, workingType: HOUR_TYPE.NotWorking },
          { hourId: 2, workingType: HOUR_TYPE.NotWorking },
          { hourId: 3, workingType: HOUR_TYPE.NotWorking },
          { hourId: 4, workingType: HOUR_TYPE.NotWorking },
          { hourId: 5, workingType: HOUR_TYPE.NotWorking },
          { hourId: 6, workingType: HOUR_TYPE.NotWorking },
          { hourId: 7, workingType: HOUR_TYPE.ExtendedHour },
          { hourId: 8, workingType: HOUR_TYPE.ExtendedHour },
          { hourId: 9, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 10, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 11, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 12, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 13, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 14, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 15, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 16, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 17, workingType: HOUR_TYPE.ExtendedHour },
          { hourId: 18, workingType: HOUR_TYPE.ExtendedHour },
          { hourId: 19, workingType: HOUR_TYPE.NotWorking },
          { hourId: 20, workingType: HOUR_TYPE.NotWorking },
          { hourId: 21, workingType: HOUR_TYPE.NotWorking },
          { hourId: 22, workingType: HOUR_TYPE.NotWorking },
          { hourId: 23, workingType: HOUR_TYPE.NotWorking },
        ]
      },
      {
        dayId: 2, hours: [
          { hourId: 0, workingType: HOUR_TYPE.NotWorking },
          { hourId: 1, workingType: HOUR_TYPE.NotWorking },
          { hourId: 2, workingType: HOUR_TYPE.NotWorking },
          { hourId: 3, workingType: HOUR_TYPE.NotWorking },
          { hourId: 4, workingType: HOUR_TYPE.NotWorking },
          { hourId: 5, workingType: HOUR_TYPE.NotWorking },
          { hourId: 6, workingType: HOUR_TYPE.NotWorking },
          { hourId: 7, workingType: HOUR_TYPE.ExtendedHour },
          { hourId: 8, workingType: HOUR_TYPE.ExtendedHour },
          { hourId: 9, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 10, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 11, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 12, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 13, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 14, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 15, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 16, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 17, workingType: HOUR_TYPE.ExtendedHour },
          { hourId: 18, workingType: HOUR_TYPE.ExtendedHour },
          { hourId: 19, workingType: HOUR_TYPE.NotWorking },
          { hourId: 20, workingType: HOUR_TYPE.NotWorking },
          { hourId: 21, workingType: HOUR_TYPE.NotWorking },
          { hourId: 22, workingType: HOUR_TYPE.NotWorking },
          { hourId: 23, workingType: HOUR_TYPE.NotWorking },
        ]
      },
      {
        dayId: 3, hours: [
          { hourId: 0, workingType: HOUR_TYPE.NotWorking },
          { hourId: 1, workingType: HOUR_TYPE.NotWorking },
          { hourId: 2, workingType: HOUR_TYPE.NotWorking },
          { hourId: 3, workingType: HOUR_TYPE.NotWorking },
          { hourId: 4, workingType: HOUR_TYPE.NotWorking },
          { hourId: 5, workingType: HOUR_TYPE.NotWorking },
          { hourId: 6, workingType: HOUR_TYPE.NotWorking },
          { hourId: 7, workingType: HOUR_TYPE.ExtendedHour },
          { hourId: 8, workingType: HOUR_TYPE.ExtendedHour },
          { hourId: 9, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 10, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 11, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 12, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 13, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 14, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 15, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 16, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 17, workingType: HOUR_TYPE.ExtendedHour },
          { hourId: 18, workingType: HOUR_TYPE.ExtendedHour },
          { hourId: 19, workingType: HOUR_TYPE.NotWorking },
          { hourId: 20, workingType: HOUR_TYPE.NotWorking },
          { hourId: 21, workingType: HOUR_TYPE.NotWorking },
          { hourId: 22, workingType: HOUR_TYPE.NotWorking },
          { hourId: 23, workingType: HOUR_TYPE.NotWorking },
        ]
      },
      {
        dayId: 4, hours: [
          { hourId: 0, workingType: HOUR_TYPE.NotWorking },
          { hourId: 1, workingType: HOUR_TYPE.NotWorking },
          { hourId: 2, workingType: HOUR_TYPE.NotWorking },
          { hourId: 3, workingType: HOUR_TYPE.NotWorking },
          { hourId: 4, workingType: HOUR_TYPE.NotWorking },
          { hourId: 5, workingType: HOUR_TYPE.NotWorking },
          { hourId: 6, workingType: HOUR_TYPE.NotWorking },
          { hourId: 7, workingType: HOUR_TYPE.ExtendedHour },
          { hourId: 8, workingType: HOUR_TYPE.ExtendedHour },
          { hourId: 9, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 10, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 11, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 12, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 13, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 14, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 15, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 16, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 17, workingType: HOUR_TYPE.ExtendedHour },
          { hourId: 18, workingType: HOUR_TYPE.ExtendedHour },
          { hourId: 19, workingType: HOUR_TYPE.NotWorking },
          { hourId: 20, workingType: HOUR_TYPE.NotWorking },
          { hourId: 21, workingType: HOUR_TYPE.NotWorking },
          { hourId: 22, workingType: HOUR_TYPE.NotWorking },
          { hourId: 23, workingType: HOUR_TYPE.NotWorking },
        ]
      },
      {
        dayId: 5, hours: [
          { hourId: 0, workingType: HOUR_TYPE.NotWorking },
          { hourId: 1, workingType: HOUR_TYPE.NotWorking },
          { hourId: 2, workingType: HOUR_TYPE.NotWorking },
          { hourId: 3, workingType: HOUR_TYPE.NotWorking },
          { hourId: 4, workingType: HOUR_TYPE.NotWorking },
          { hourId: 5, workingType: HOUR_TYPE.NotWorking },
          { hourId: 6, workingType: HOUR_TYPE.NotWorking },
          { hourId: 7, workingType: HOUR_TYPE.ExtendedHour },
          { hourId: 8, workingType: HOUR_TYPE.ExtendedHour },
          { hourId: 9, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 10, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 11, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 12, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 13, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 14, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 15, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 16, workingType: HOUR_TYPE.WorkingHour },
          { hourId: 17, workingType: HOUR_TYPE.ExtendedHour },
          { hourId: 18, workingType: HOUR_TYPE.ExtendedHour },
          { hourId: 19, workingType: HOUR_TYPE.NotWorking },
          { hourId: 20, workingType: HOUR_TYPE.NotWorking },
          { hourId: 21, workingType: HOUR_TYPE.NotWorking },
          { hourId: 22, workingType: HOUR_TYPE.NotWorking },
          { hourId: 23, workingType: HOUR_TYPE.NotWorking },
        ]
      },
      {
        dayId: 6, hours: [
          { hourId: 0, workingType: HOUR_TYPE.NotWorking },
          { hourId: 1, workingType: HOUR_TYPE.NotWorking },
          { hourId: 2, workingType: HOUR_TYPE.NotWorking },
          { hourId: 3, workingType: HOUR_TYPE.NotWorking },
          { hourId: 4, workingType: HOUR_TYPE.NotWorking },
          { hourId: 5, workingType: HOUR_TYPE.NotWorking },
          { hourId: 6, workingType: HOUR_TYPE.NotWorking },
          { hourId: 7, workingType: HOUR_TYPE.NotWorking },
          { hourId: 8, workingType: HOUR_TYPE.NotWorking },
          { hourId: 9, workingType: HOUR_TYPE.NotWorking },
          { hourId: 10, workingType: HOUR_TYPE.NotWorking },
          { hourId: 11, workingType: HOUR_TYPE.NotWorking },
          { hourId: 12, workingType: HOUR_TYPE.NotWorking },
          { hourId: 13, workingType: HOUR_TYPE.NotWorking },
          { hourId: 14, workingType: HOUR_TYPE.NotWorking },
          { hourId: 15, workingType: HOUR_TYPE.NotWorking },
          { hourId: 16, workingType: HOUR_TYPE.NotWorking },
          { hourId: 17, workingType: HOUR_TYPE.NotWorking },
          { hourId: 18, workingType: HOUR_TYPE.NotWorking },
          { hourId: 19, workingType: HOUR_TYPE.NotWorking },
          { hourId: 20, workingType: HOUR_TYPE.NotWorking },
          { hourId: 21, workingType: HOUR_TYPE.NotWorking },
          { hourId: 22, workingType: HOUR_TYPE.NotWorking },
          { hourId: 23, workingType: HOUR_TYPE.NotWorking },
        ]
      },
      {
        dayId: 7, hours: [
          { hourId: 0, workingType: HOUR_TYPE.NotWorking },
          { hourId: 1, workingType: HOUR_TYPE.NotWorking },
          { hourId: 2, workingType: HOUR_TYPE.NotWorking },
          { hourId: 3, workingType: HOUR_TYPE.NotWorking },
          { hourId: 4, workingType: HOUR_TYPE.NotWorking },
          { hourId: 5, workingType: HOUR_TYPE.NotWorking },
          { hourId: 6, workingType: HOUR_TYPE.NotWorking },
          { hourId: 7, workingType: HOUR_TYPE.NotWorking },
          { hourId: 8, workingType: HOUR_TYPE.NotWorking },
          { hourId: 9, workingType: HOUR_TYPE.NotWorking },
          { hourId: 10, workingType: HOUR_TYPE.NotWorking },
          { hourId: 11, workingType: HOUR_TYPE.NotWorking },
          { hourId: 12, workingType: HOUR_TYPE.NotWorking },
          { hourId: 13, workingType: HOUR_TYPE.NotWorking },
          { hourId: 14, workingType: HOUR_TYPE.NotWorking },
          { hourId: 15, workingType: HOUR_TYPE.NotWorking },
          { hourId: 16, workingType: HOUR_TYPE.NotWorking },
          { hourId: 17, workingType: HOUR_TYPE.NotWorking },
          { hourId: 18, workingType: HOUR_TYPE.NotWorking },
          { hourId: 19, workingType: HOUR_TYPE.NotWorking },
          { hourId: 20, workingType: HOUR_TYPE.NotWorking },
          { hourId: 21, workingType: HOUR_TYPE.NotWorking },
          { hourId: 22, workingType: HOUR_TYPE.NotWorking },
          { hourId: 23, workingType: HOUR_TYPE.NotWorking },
        ]
      },]
  ) { }

}

export interface IDay {
  dayId: number;
  hours: IHour[];
}
export class Day implements IDay {
  constructor(
    public dayId: number = 0,
    public hours: IHour[] = _hourList
  ) { }

}
export interface IHour {
  hourId: number;
  workingType: HOUR_TYPE;
}
export class Hour implements IHour {
  constructor(
    public hourId: number = 0,
    public workingType: HOUR_TYPE = HOUR_TYPE.NotWorking
  ) { }

}

export interface ITimeZone {
  alias: string;
  displayName: string;
}

export class TimeZone implements ITimeZone {
  constructor(
    public alias: string = "",
    public displayName: string = ""
  ) { }
}