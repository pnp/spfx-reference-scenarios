export interface IList {
  Id: number;
  Title: string;
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

export interface ISelfCheckIn extends ISelfCheckInLI {
  Employee: string;
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
}

export interface ICheckIn extends ICheckInLI {
  Employee: IPerson
  CheckInBy: IPerson;
}
