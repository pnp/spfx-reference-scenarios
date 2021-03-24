import { Logger, LogLevel } from "@pnp/logging";

import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items/list";

import * as lodash from "lodash";
import { sp } from "@pnp/sp";
import { ILocations, IQuestion, ICheckIn, ISelfCheckIn, SelfCheckInLI, CheckInLI, ISelfCheckInLI } from "./covid.model";

export interface ICovidService {

}

export class CovidService implements ICovidService {
  private LOG_SOURCE = "CovidService";

  private SKIPADDFIELDS: string[] = ["Id", "CreatedOn"];
  private LOCATIONLIST = "CheckInLocations";
  private QUESTIONLIST = "CheckInQuestions";
  private SELFCHECKINLIST = "SelfCheckIn";
  private COVIDCHECKINLIST = "CovidCheckIn";

  private _ready: boolean = false;
  private _locations: ILocations[];
  private _questions: IQuestion[];
  private _checkIns: ICheckIn[];

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

  public get CheckIns(): ICheckIn[] {
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
      Logger.write(`${err} - ${this.LOG_SOURCE} (init)`, LogLevel.Error);
    }
  }

  private async getLocations(): Promise<boolean> {
    let retVal: boolean = false;
    try {
      this._locations = await sp.web.lists.getByTitle(this.LOCATIONLIST).items.top(5000).select("Id, Title").get<ILocations[]>();
      retVal = true;
    } catch (err) {
      Logger.write(`${err} - ${this.LOG_SOURCE} (getLocations)`, LogLevel.Error);
    }
    return retVal;
  }

  private async getQuestions(): Promise<boolean> {
    let retVal: boolean = false;
    try {
      this._questions = await sp.web.lists.getByTitle(this.QUESTIONLIST).items.top(5000).select("Id, Title, ToolTip, QuestionType, Order").filter("Enabled eq 1").orderBy("Order").get<IQuestion[]>();
      retVal = true;
    } catch (err) {
      Logger.write(`${err} - ${this.LOG_SOURCE} (getQuestions)`, LogLevel.Error);
    }
    return retVal;
  }

  public async getCheckIns(today: Date): Promise<boolean> {
    let retVal: boolean = false;
    try {
      this._checkIns = await sp.web.lists.getByTitle(this.COVIDCHECKINLIST).items.top(5000)
        .select("Id, Title, EmployeeId, Employee/Id, Employee/Title, Guest, CheckInOffice, Questions, CheckIn, CheckInById, CheckInBy/Id, CheckInBy/Title")
        .expand("Employee, CheckInBy")
        .get<ICheckIn[]>();

      retVal = true;
    } catch (err) {
      Logger.write(`${err} - ${this.LOG_SOURCE} (getCheckIns)`, LogLevel.Error);
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
          Object.getOwnPropertyNames(sci).forEach(prop => {
            checkInLI[prop] = sci[prop];
          });
          this.SKIPADDFIELDS.forEach(f => { delete checkInLI[f] });
          sp.web.lists.getByTitle(this.COVIDCHECKINLIST).items.inBatch(batch).add(checkInLI);
        });
        await batch.execute();
        retVal = true;
      }
    } catch (err) {
      Logger.write(`${err} - ${this.LOG_SOURCE} (moveSelfCheckIns)`, LogLevel.Error);
    }
    return retVal;
  }

  public async addCheckIn(checkIn: ICheckIn): Promise<boolean> {
    let retVal: boolean = false;
    try {
      let checkInLI = new CheckInLI();
      Object.getOwnPropertyNames(checkInLI).forEach(prop => {
        checkInLI[prop] = checkIn[prop];
      });
      this.SKIPADDFIELDS.forEach(f => { delete checkInLI[f] });
      const addCheckIn = await sp.web.lists.getByTitle(this.COVIDCHECKINLIST).items.add(checkInLI);
      if (addCheckIn.item)
        retVal = true;
      retVal = true;
    } catch (err) {
      Logger.write(`${err} - ${this.LOG_SOURCE} (addCheckIn)`, LogLevel.Error);
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
      this.SKIPADDFIELDS.forEach(f => { delete selfCheckInLI[f] });
      const addSelfCheckIn = await sp.web.lists.getByTitle(this.SELFCHECKINLIST).items.add(selfCheckInLI);
      if (addSelfCheckIn.item)
        retVal = true;
    } catch (err) {
      Logger.write(`${err} - ${this.LOG_SOURCE} (addSelfCheckIn)`, LogLevel.Error);
    }
    return retVal;
  }
}

export const cs = new CovidService();