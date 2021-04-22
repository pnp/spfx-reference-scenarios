
export enum PERSON_TYPE {
  LocGuest = 1,
  Employee
}

export enum CONFIG_TYPE {
  Personal = 1,
  Team
}

export interface IPerson {
  personId: string;
  personType: PERSON_TYPE;
  displayName: string;
  workDays: string;
  workHours: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  IANATimezone: string;
}

export class Person implements IPerson {
  constructor(
    public personId: string = "",
    public personType: PERSON_TYPE = null,
    public displayName: string = "",
    public workDays: string = "",
    public workHours: string = "",
    public firstName: string = null,
    public lastName: string = null,
    public photoUrl: string = null,
    public IANATimezone: string = null
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

export interface IView {
  viewId: string;
  viewName: string;
  members: IPerson[];
}

export class View implements IView {
  constructor(
    public viewId: string = null,
    public viewName: string = null,
    public members: IPerson[] = []
  ) { }
}

export interface IConfig {
  configType: CONFIG_TYPE;
  configPerson: IPerson;
  configTeam: ITeam;
  members: IPerson[];
  views: IView[];
}

export class Config implements IConfig {
  constructor(
    public configType: CONFIG_TYPE = null,
    public configPerson: IPerson = null,
    public configTeam: ITeam = null,
    public members: IPerson[] = [],
    public views: IView[] = []
  ) { }
}