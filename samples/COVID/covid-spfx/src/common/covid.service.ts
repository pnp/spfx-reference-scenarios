import { Logger, LogLevel } from "@pnp/logging";

import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items/list";
import "@pnp/sp/site-users/web";

import * as lodash from "lodash";
import { sp } from "@pnp/sp";
import { ILocations, IQuestion, ICheckIns, ISelfCheckIn, SelfCheckInLI, CheckInLI, ISelfCheckInLI, IAnswer } from "./covid.model";

const mockAnswers: IAnswer[] = [{ QuestionId: 1, Answer: "no" }, { QuestionId: 2, Answer: "98.2" }, { QuestionId: 3, Answer: "no" }, { QuestionId: 4, Answer: "no" }, { QuestionId: 5, Answer: "no" }, { QuestionId: 6, Answer: "no" }, { QuestionId: 7, Answer: "no" }];

export interface ICovidService {

}

export class CovidService implements ICovidService {
  private LOG_SOURCE = "🔶CovidService";

  private SKIPADDFIELDS: string[] = ["Id", "CreatedOn"];
  private LOCATIONLIST = "CheckInLocations";
  private QUESTIONLIST = "CheckInQuestions";
  private SELFCHECKINLIST = "SelfCheckIn";
  private COVIDCHECKINLIST = "CovidCheckIn";

  private _ready: boolean = false;
  private _locations: ILocations[];
  private _questions: IQuestion[];
  private _checkIns: ICheckIns[];

  constructor() { }

  public get Ready(): boolean {
    return this._ready;
  }

  public get Locations(): ILocations[] {
    return this._locations;
  }

  public get Questions(): IQuestion[] {
    return this._questions;
  }

  public get CheckIns(): ICheckIns[] {
    return this._checkIns;
  }

  public async init(): Promise<void> {
    try {
      let success: boolean[] = [];
      success.push(await this.getLocations());
      success.push(await this.getQuestions());
      if (success.indexOf(false) == -1) {
        this._ready = true;
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (init) - ${err}`, LogLevel.Error);
    }
  }

  private async getLocations(): Promise<boolean> {
    let retVal: boolean = false;
    try {
      this._locations = await sp.web.lists.getByTitle(this.LOCATIONLIST).items.top(5000).select("Id, Title").get<ILocations[]>();
      retVal = true;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (getLocations) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  private async getQuestions(): Promise<boolean> {
    let retVal: boolean = false;
    try {
      this._questions = await sp.web.lists.getByTitle(this.QUESTIONLIST).items.top(5000).select("Id, Title, ToolTip, QuestionType, Order").filter("Enabled eq 1").orderBy("Order").get<IQuestion[]>();
      retVal = true;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (getQuestions) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  public async userCanCheckIn(loginName: string): Promise<boolean> {
    let retVal: boolean = false;
    try {
      await this.moveSelfCheckIns();
      const user = await sp.web.ensureUser(loginName);
      if (user.data) {
        const today = new Date((new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDay());
        const checkIns = await sp.web.lists.getByTitle(this.COVIDCHECKINLIST).items.top(1)
          .filter(`(EmployeeId eq ${user.data.Id}) and (CreatedOn gt ${today.toUTCString()})`)
          .get();

        if (checkIns.length < 1)
          retVal = true;
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (userCanCheckIn) - ${err} - `, LogLevel.Error);
    }
    return retVal;
  }

  public async getCheckIns(today: Date): Promise<boolean> {
    let retVal: boolean = false;
    try {
      this._checkIns = await sp.web.lists.getByTitle(this.COVIDCHECKINLIST).items.top(5000)
        .select("Id, Title, EmployeeId, Employee/Id, Employee/Title, Guest, CheckInOffice, Questions, CheckIn, CheckInById, CheckInBy/Id, CheckInBy/Title")
        .expand("Employee, CheckInBy")
        .get<ICheckIns[]>();


      retVal = true;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (getCheckIns) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  public async moveSelfCheckIns(): Promise<boolean> {
    let retVal: boolean = false;
    try {
      //Get Self CheckIns
      const selfCheckIns = await sp.web.lists.getByTitle(this.SELFCHECKINLIST).items.top(5000)
        .select("Id, Title, EmployeeId, Questions, CreatedOn")
        .get<ISelfCheckInLI[]>();

      if (selfCheckIns.length > 0) {
        //Bulk Add to CovidCheckIns
        const batch = sp.createBatch();
        selfCheckIns.forEach(sci => {
          let checkInLI = new CheckInLI();
          checkInLI.SubmittedOn = sci.CreatedOn;
          Object.getOwnPropertyNames(sci).forEach(prop => {
            checkInLI[prop] = sci[prop];
          });
          this.SKIPADDFIELDS.forEach(f => { delete checkInLI[f]; });
          sp.web.lists.getByTitle(this.COVIDCHECKINLIST).items.inBatch(batch).add(checkInLI);
        });
        await batch.execute();
        retVal = true;
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (moveSelfCheckIns) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  public async addCheckIn(checkIn: ICheckIns): Promise<boolean> {
    let retVal: boolean = false;
    try {
      let checkInLI = new CheckInLI();
      Object.getOwnPropertyNames(checkInLI).forEach(prop => {
        checkInLI[prop] = checkIn[prop];
      });
      this.SKIPADDFIELDS.forEach(f => { delete checkInLI[f]; });
      const addCheckIn = await sp.web.lists.getByTitle(this.COVIDCHECKINLIST).items.add(checkInLI);
      if (addCheckIn.item)
        retVal = true;
      retVal = true;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (addCheckIn) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  public async addSelfCheckIn(checkIn: ISelfCheckIn): Promise<boolean> {
    let retVal: boolean = false;
    try {
      let selfCheckInLI = new SelfCheckInLI();
      Object.getOwnPropertyNames(selfCheckInLI).forEach(prop => {
        selfCheckInLI[prop] = checkIn[prop];
      });
      this.SKIPADDFIELDS.forEach(f => { delete selfCheckInLI[f]; });
      const addSelfCheckIn = await sp.web.lists.getByTitle(this.SELFCHECKINLIST).items.add(selfCheckInLI);
      if (addSelfCheckIn.item)
        retVal = true;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (addSelfCheckIn) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }
}

export const cs = new CovidService();