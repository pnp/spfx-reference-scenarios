import { Logger, LogLevel } from "@pnp/logging";

import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items/list";
import "@pnp/sp/site-users/web";

import * as lodash from "lodash";
import { sp } from "@pnp/sp";
import { ILocations, IQuestion, ICheckIns, ISelfCheckIn, SelfCheckInLI, CheckInLI, ISelfCheckInLI, IAnswer } from "./covid.model";
import { forEach } from "lodash";
import { IItemAddResult } from "@pnp/sp/items/types";

const mockAnswers: IAnswer[] = [{ QuestionId: 1, Answer: "no" }, { QuestionId: 2, Answer: "98.2" }, { QuestionId: 3, Answer: "no" }, { QuestionId: 4, Answer: "no" }, { QuestionId: 5, Answer: "no" }, { QuestionId: 6, Answer: "no" }, { QuestionId: 7, Answer: "no" }];

export interface ICovidService {

}

export class CovidService implements ICovidService {
  private LOG_SOURCE = "🔶CovidService";

  private SKIPADDFIELDS: string[] = ["Id", "Created"];
  private SKIPUPDATEFIELDS: string[] = ["Created"];
  private JSONFIELDS: string[] = ["Questions"];
  private LOCATIONLIST = "CheckInLocations";
  private QUESTIONLIST = "CheckInQuestions";
  private SELFCHECKINLIST = "SelfCheckIn";
  private COVIDCHECKINLIST = "CovidCheckIn";

  private _ready: boolean = false;
  private _locations: ILocations[];
  private _questions: IQuestion[];
  private _checkIns: ICheckIns[];

  private _checkInsRefresh: () => void = null;

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

  public set CheckInsRefresh(value: () => void) {
    this._checkInsRefresh = value;
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
      this._locations = await sp.web.lists.getByTitle(this.LOCATIONLIST).items
        .top(5000)
        .select("Id, Title")
        .get<ILocations[]>();
      retVal = true;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (getLocations) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  private async getQuestions(): Promise<boolean> {
    let retVal: boolean = false;
    try {
      this._questions = await sp.web.lists.getByTitle(this.QUESTIONLIST).items
        .top(5000)
        .select("Id, Title, ToolTip, QuestionType, Order")
        .filter("Enabled eq 1")
        .orderBy("Order")
        .get<IQuestion[]>();
      retVal = true;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (getQuestions) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  public async userCanCheckIn(userId: number): Promise<boolean> {
    let retVal: boolean = false;
    try {
      await this.moveSelfCheckIns();
      let today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkIns = await sp.web.lists.getByTitle(this.COVIDCHECKINLIST).items
        .top(1)
        .filter(`(EmployeeId eq ${userId}) and (SubmittedOn gt '${today.toISOString()}')`)
        .get();

      if (checkIns.length < 1)
        retVal = true;

    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (userCanCheckIn) - ${err} - `, LogLevel.Error);
    }
    return retVal;
  }

  public async getCheckIns(today: Date): Promise<boolean> {
    let retVal: boolean = false;
    try {
      this._checkIns = await sp.web.lists.getByTitle(this.COVIDCHECKINLIST).items
        .top(5000)
        .select("Id, Title, EmployeeId, Employee/Id, Employee/Title, Guest, CheckInOffice, Questions, CheckIn, CheckInById, CheckInBy/Id, CheckInBy/Title")
        .expand("Employee, CheckInBy")
        .get<ICheckIns[]>();

      Object.getOwnPropertyNames(this._checkIns).forEach(prop => {
        if (this.JSONFIELDS.indexOf(prop) > -1) {
          this._checkIns[`${prop}Value`] = JSON.parse(this._checkIns[prop]);
        }
      });

      if (typeof this._checkInsRefresh == "function") {
        this._checkInsRefresh();
      }
      retVal = true;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (getCheckIns) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  public moveSelfCheckIns(): Promise<boolean> {
    return new Promise(async (resolve) => {
      try {
        //Get Self CheckIns
        const selfCheckIns = await sp.web.lists.getByTitle(this.SELFCHECKINLIST).items
          .top(5000)
          .select("Id, Title, EmployeeId, CheckInOffice, Questions, Created")
          .get<ISelfCheckInLI[]>();

        if (selfCheckIns.length > 0) {
          let p = [];
          let pd = [];
          //Bulk Add to CovidCheckIns
          const batch = sp.createBatch();
          const batchDelete = sp.createBatch();
          selfCheckIns.forEach(sci => {
            let checkInLI = new CheckInLI();
            checkInLI.SubmittedOn = sci.Created;
            Object.getOwnPropertyNames(sci).forEach(prop => {
              checkInLI[prop] = sci[prop];
            });
            this.SKIPADDFIELDS.forEach(f => { delete checkInLI[f]; });
            p.push(sp.web.lists.getByTitle(this.COVIDCHECKINLIST).items.inBatch(batch).add(checkInLI));
            pd.push(sp.web.lists.getByTitle(this.SELFCHECKINLIST).items.getById(sci.Id).inBatch(batchDelete).delete());
          });
          batch.execute().then(async () => {
            let result: boolean = true;
            forEach(p, (item: IItemAddResult) => {
              if (item == null)
                result = false;
            });
            if (result) {
              batchDelete.execute();
              const success = await this.getCheckIns(new Date());
              resolve(success);
            } else {
              resolve(result);
            }
          });
        } else {
          resolve(true);
        }
      } catch (err) {
        Logger.write(`${this.LOG_SOURCE} (moveSelfCheckIns) - ${err}`, LogLevel.Error);
        resolve(false);
      }
    });
  }

  public async addCheckIn(checkIn: ICheckIns): Promise<boolean> {
    let retVal: boolean = false;
    try {
      let checkInLI = new CheckInLI();
      Object.getOwnPropertyNames(checkInLI).forEach(prop => {
        if (this.JSONFIELDS.indexOf(prop) > -1) {
          checkInLI[prop] = JSON.stringify(checkIn[`${prop}Value`]);
        } else {
          checkInLI[prop] = checkIn[prop];
        }
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

  public async adminCheckIn(checkIn: ICheckIns): Promise<boolean> {
    let retVal: boolean = false;
    try {
      const data = { CheckIn: checkIn.CheckIn, CheckInById: checkIn.CheckInById };
      const updateCheckIn = await sp.web.lists.getByTitle(this.COVIDCHECKINLIST).items.getById(checkIn.Id).update(data);
      if (updateCheckIn.item)
        retVal = true;
      retVal = true;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (adminCheckIn) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  public async addSelfCheckIn(checkIn: ISelfCheckIn): Promise<boolean> {
    let retVal: boolean = false;
    try {
      let selfCheckInLI = new SelfCheckInLI();
      Object.getOwnPropertyNames(selfCheckInLI).forEach(prop => {
        if (this.JSONFIELDS.indexOf(prop) > -1) {
          selfCheckInLI[prop] = JSON.stringify(checkIn[`${prop}Value`]);
        } else {
          selfCheckInLI[prop] = checkIn[prop];
        }
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