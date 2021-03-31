export interface IList {
  Id: number;
  Title: string;
  CreatedOn: Date;
}

export interface ILocations extends IList { }

export interface IQuestion extends IList {
  ToolTip: string;
  QuestionType: string;
  Order: number;
  Enabled: boolean;
}

export interface IAnswer {
  QuestionId: number;
  Answer: string;
}

export interface ISelfCheckInLI extends IList {
  EmployeeId: number;
  Questions: IAnswer[];
}

export class SelfCheckInLI implements ISelfCheckInLI {
  constructor(
    public Id: number = 0,
    public Title: string = "",
    public CreatedOn: Date = null,
    public EmployeeId: number = null,
    public Questions: IAnswer[] = null
  ) { }
}

export interface ISelfCheckIn extends ISelfCheckInLI {
  Employee: IPerson;
}

export class SelfCheckIn implements ISelfCheckIn {
  constructor(
    public Id: number = 0,
    public Title: string = "",
    public CreatedOn: Date = null,
    public EmployeeId: number = null,
    public Questions: IAnswer[] = null,
    public Employee: IPerson = null
  ) { }
}

export interface IPerson {
  Id: number;
  Title: string;
}

export interface ICheckInLI extends IList {
  EmployeeId: number;
  Guest: string;
  CheckInOffice: string;
  Questions: IAnswer[];
  CheckIn: Date;
  CheckInById: number;
  SubmittedOn: Date;
}

export class CheckInLI implements ICheckInLI {
  constructor(
    public Id: number = 0,
    public Title: string = "",
    public CreatedOn: Date = null,
    public EmployeeId: number = null,
    public Guest: string = "",
    public CheckInOffice: string = "",
    public Questions: IAnswer[] = null,
    public CheckIn: Date = null,
    public CheckInById: number = null,
    public SubmittedOn: Date = null
  ) { }
}

export interface ICheckIns extends ICheckInLI {
  Employee: IPerson;
  CheckInBy: IPerson;
}

export class CheckIns implements ICheckIns {
  constructor(
    public Id: number = 0,
    public Title: string = "",
    public CreatedOn: Date = null,
    public EmployeeId: number = null,
    public Guest: string = "",
    public CheckInOffice: string = "",
    public Questions: IAnswer[] = null,
    public CheckIn: Date = null,
    public CheckInById: number = null,
    public SubmittedOn: Date = null,
    public Employee: IPerson = null,
    public CheckInBy: IPerson = null
  ) { }
}

export enum QuestionType {
  YesNo = "Yes/No",
  Text = "Text"
}
export enum CheckInMode {
  Self = "Self",
  Guest = "Guest"
}
