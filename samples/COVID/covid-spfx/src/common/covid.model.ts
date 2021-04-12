
import { Presence as IUserPresence } from "@microsoft/microsoft-graph-types";

export enum Tables {
  LOCATIONLIST = "CheckInLocations",
  QUESTIONLIST = "CheckInQuestions",
  SELFCHECKINLIST = "SelfCheckIn",
  COVIDCHECKINLIST = "CovidCheckIn"
}

export interface IFieldList {
  name: string;
  props: { FieldTypeKind: number, choices?: string[], richText?: boolean };
}

export const QUESTIONLISTFields: IFieldList[] = [
  { name: "Question", props: { "FieldTypeKind": 2 } },
  { name: "ToolTip", props: { "FieldTypeKind": 3, "richText": false } },
  { name: "QuestionType", props: { "FieldTypeKind": 6, "choices": ["Yes/No", "Text"] } },
  { name: "Order", props: { "FieldTypeKind": 9 } },
  { name: "Enabled", props: { "FieldTypeKind": 8 } },
];

export const SELFCHECKINLISTFields: IFieldList[] = [
  { name: "CheckInOffice", props: { "FieldTypeKind": 2 } },
  { name: "Employee", props: { "FieldTypeKind": 20 } },
  { name: "Questions", props: { "FieldTypeKind": 3, "richText": false } }
];

export const COVIDCHECKINLISTFields: IFieldList[] = [
  { name: "CheckInOffice", props: { "FieldTypeKind": 2 } },
  { name: "Employee", props: { "FieldTypeKind": 20 } },
  { name: "Questions", props: { "FieldTypeKind": 3, "richText": false } },
  { name: "CheckIn", props: { "FieldTypeKind": 4 } },
  { name: "CheckInBy", props: { "FieldTypeKind": 20 } },
  { name: "Guest", props: { "FieldTypeKind": 2 } },
  { name: "SubmittedOn", props: { "FieldTypeKind": 4 } },
];

export interface IList {
  Id: number;
  Title: string;
  Created: Date;
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
  Questions: string;
  CheckInOffice: string;
}

export class SelfCheckInLI implements ISelfCheckInLI {
  constructor(
    public Id: number = 0,
    public Title: string = "",
    public CheckInOffice: string = "",
    public Created: Date = null,
    public EmployeeId: number = null,
    public Questions: string = null
  ) { }
}

export interface ISelfCheckIn extends ISelfCheckInLI {
  QuestionsValue: IAnswer[];
  Employee: IPerson;
}

export class SelfCheckIn implements ISelfCheckIn {
  constructor(
    public Id: number = 0,
    public Title: string = "",
    public CheckInOffice: string = "",
    public Created: Date = null,
    public EmployeeId: number = null,
    public Questions: string = null,
    public QuestionsValue: IAnswer[] = null,
    public Employee: IPerson = null
  ) { }
}

export interface IPerson {
  Id: number;
  Title: string;
  EMail: string;
  GraphId: string;
  Presence: IUserPresence;
  PhotoBlobUrl: string;
  JobTitle: string;
}

export interface ICheckInLI extends IList {
  EmployeeId: number;
  Guest: string;
  CheckInOffice: string;
  Questions: string;
  CheckIn: Date;
  CheckInById: number;
  SubmittedOn: Date;
}

export class CheckInLI implements ICheckInLI {
  constructor(
    public Id: number = 0,
    public Title: string = "",
    public Created: Date = null,
    public EmployeeId: number = null,
    public Guest: string = "",
    public CheckInOffice: string = "",
    public Questions: string = null,
    public CheckIn: Date = null,
    public CheckInById: number = null,
    public SubmittedOn: Date = new Date()
  ) { }
}

export interface ICheckIns extends ICheckInLI {
  Employee: IPerson;
  CheckInBy: IPerson;
  QuestionsValue: IAnswer[];
}

export class CheckIns implements ICheckIns {
  constructor(
    public Id: number = 0,
    public Title: string = "",
    public Created: Date = null,
    public EmployeeId: number = null,
    public Guest: string = null,
    public CheckInOffice: string = "",
    public QuestionsValue: IAnswer[] = null,
    public SubmittedOn: Date = null,
    public CheckIn: Date = null,
    public CheckInById: number = null,
    public Employee: IPerson = null,
    public CheckInBy: IPerson = null,
    public Questions: string = null,
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
export interface IIconType {
  Class: string;
  SVG: string;
}

export interface IQuery {
  startDate: Date;
  endDate: Date;
  office: string;
  person: string | number;
}

export class Query implements IQuery {
  constructor(
    public startDate: Date = null,
    public endDate: Date = null,
    public office: string = null,
    public person: string | number = null
  ) { }
}

export interface ISearchResults {
  resultGroups: IResultGroup[];
}

export interface IResultGroup {
  groupHeader: string;
  result: ICheckIns[];
}

export class ResultGroup implements IResultGroup {
  constructor(
    public groupHeader: string = null,
    public result: ICheckIns[] = []
  ) { }
}

export class SearchResults implements ISearchResults {
  constructor(
    public resultGroups: IResultGroup[] = []
  ) { }
}