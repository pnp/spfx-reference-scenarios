import forEach from "lodash/forEach";
import findIndex from "lodash/findIndex";
import cloneDeep from "lodash/cloneDeep";
import find from "lodash/find";
import indexOf from "lodash/indexOf";
import groupBy from "lodash/groupBy";

import { graph } from "@pnp/graph";
import "@pnp/graph/users";
import "@pnp/graph/photos";
import "@pnp/graph/cloud-communications";

import { MSGraphClient } from '@microsoft/sp-http';

import * as lodash from "lodash";
import { sp } from "@pnp/sp";
import { Logger, LogLevel } from "@pnp/logging";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items/list";
import "@pnp/sp/site-users/web";
import { IItemAddResult } from "@pnp/sp/items/types";

import { ILocations, IQuestion, ICheckIns, ISelfCheckIn, SelfCheckInLI, CheckInLI, ISelfCheckInLI, IAnswer, Tables, IPerson, IQuery, ISearchResults, Person } from "./covid.model";

const mockAnswers: IAnswer[] = [{ QuestionId: 1, Answer: "no" }, { QuestionId: 2, Answer: "98.2" }, { QuestionId: 3, Answer: "no" }, { QuestionId: 4, Answer: "no" }, { QuestionId: 5, Answer: "no" }, { QuestionId: 6, Answer: "no" }, { QuestionId: 7, Answer: "no" }];

export interface ICovidService {

}

export class CovidService implements ICovidService {
  private LOG_SOURCE = "🔶CovidService";

  private SKIPADDFIELDS: string[] = ["Id", "Created"];
  private SKIPUPDATEFIELDS: string[] = ["Created"];
  private JSONFIELDS: string[] = ["Questions"];
  private JSONDATEFIELDS: string[] = ["Created", "CheckIn", "SubmittedOn"];

  private _graphClient: MSGraphClient;
  private _ready: boolean = false;
  private _locations: ILocations[];
  private _questions: IQuestion[];
  private _checkIns: ICheckIns[];
  private _users: IPerson[] = [];
  private _currentDate: Date;
  private _questionListUrl: string;
  private _locationListUrl: string;

  private _checkInsRefresh: (selectedDate: Date) => void = null;

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

  public get QuestionListUrl(): string {
    return this._questionListUrl;
  }

  public get LocationListUrl(): string {
    return this._locationListUrl;
  }

  public set CheckInsRefresh(value: (selectedDate: Date) => void) {
    this._checkInsRefresh = value;
  }

  public async init(httpGraph?: MSGraphClient): Promise<void> {
    try {
      this._locationListUrl = `${sp.site.toUrl()}/Lists/${Tables.LOCATIONLIST}/AllItems.aspx`;
      this._questionListUrl = `${sp.site.toUrl()}/Lists/${Tables.QUESTIONLIST}/AllItems.aspx`;
      this._graphClient = httpGraph;
      let success: boolean[] = [];
      success.push(await this.getLocations());
      success.push(await this.getQuestions());
      if (success.indexOf(false) == -1) {
        this._ready = true;
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (init) - ${err.message}`, LogLevel.Error);
    }
  }

  private async getLocations(): Promise<boolean> {
    let retVal: boolean = false;
    try {
      this._locations = await sp.web.lists.getByTitle(Tables.LOCATIONLIST).items
        .top(5000)
        .select("Id, Title")
        .get<ILocations[]>();
      retVal = true;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (getLocations) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  private async getQuestions(): Promise<boolean> {
    let retVal: boolean = false;
    try {
      this._questions = await sp.web.lists.getByTitle(Tables.QUESTIONLIST).items
        .top(5000)
        .select("Id, Title, ToolTip, QuestionType, Order")
        .filter("Enabled eq 1")
        .orderBy("Order")
        .get<IQuestion[]>();
      retVal = true;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (getQuestions) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  public async userCanCheckIn(userId: number): Promise<boolean> {
    let retVal: boolean = false;
    try {
      await this.moveSelfCheckIns();
      let today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const checkIns = await sp.web.lists.getByTitle(Tables.COVIDCHECKINLIST).items
        .top(1)
        .filter(`(EmployeeId eq ${userId}) and (SubmittedOn gt '${today.toISOString()}')`)
        .get();

      if (checkIns.length < 1)
        retVal = true;

    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (userCanCheckIn) - ${err.message} - `, LogLevel.Error);
    }
    return retVal;
  }

  private async _updateIPerson(checkIns: ICheckIns[] | IPerson[]): Promise<void> {
    try {
      let ids: string[] = [];
      for (let i = 0; i < checkIns.length; i++) {
        if (checkIns[i].hasOwnProperty("GraphId")) {
          let p: IPerson = checkIns[i] as IPerson;
          let idxEmp = findIndex(this._users, { Id: p.Id });
          if (idxEmp < 0) {
            idxEmp = await this._loadUserData(p);
          }
          if (idxEmp > -1) {
            p = this._users[idxEmp];
            if (indexOf(ids, p.GraphId) == -1)
              ids.push(p.GraphId);
          }
        } else {
          const ci: ICheckIns = checkIns[i] as ICheckIns;
          if (ci.CheckInById != null) {
            let idxCIB = findIndex(this._users, { Id: ci.CheckInById });
            if (idxCIB < 0) {
              idxCIB = await this._loadUserData(ci.CheckInBy);
            }
            if (idxCIB > -1) {
              ci.CheckInBy = this._users[idxCIB];
              if (indexOf(ids, ci.CheckInBy.GraphId) == -1)
                ids.push(ci.CheckInBy.GraphId);
            }
          }
          if (ci.EmployeeId != null) {
            let idxEmp = findIndex(this._users, { Id: ci.EmployeeId });
            if (idxEmp < 0) {
              idxEmp = await this._loadUserData(ci.Employee);
            }
            if (idxEmp > -1) {
              ci.Employee = this._users[idxEmp];
              if (indexOf(ids, ci.Employee.GraphId) == -1)
                ids.push(ci.Employee.GraphId);
            }
          }
        }
      }

      if (ids.length > 0) {
        await this._loadUserPresence(ids);
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_updateIPerson) - ${err.message} - `, LogLevel.Error);
    }
  }

  private async _loadUserData(user: IPerson): Promise<number> {
    let retVal: number = -1;
    try {
      const u = await graph.users.getById(user.EMail).select("id, jobTitle")();
      if (u) {
        user.GraphId = u.id;
        user.JobTitle = u.jobTitle;
        try {
          const photoValue = await graph.users.getById(user.GraphId).photo.getBlob();
          if (photoValue) {
            const url = window.URL || window.webkitURL;
            user.PhotoBlobUrl = url.createObjectURL(photoValue);
          }
        } catch (e) { }
        retVal = this._users.push(user) - 1;
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_loadUserData) - ${err.message} - `, LogLevel.Error);
    }
    return retVal;
  }

  private async _loadUserPresence(ids: string[]): Promise<void> {
    try {
      const p = await graph.communications.getPresencesByUserId(ids);
      if (p) {
        for (let i = 0; i < p.length; i++) {
          const user = find(this._users, { GraphId: p[i].id });
          if (user) {
            user.Presence = p[i];
          }
        }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_loadUserPresence) - ${err.message} - `, LogLevel.Error);
    }
  }

  public async getCheckIns(d: Date): Promise<boolean> {
    let retVal: boolean = false;
    try {
      const start = cloneDeep(d);
      const end = cloneDeep(d);
      start.setUTCHours(0, 0, 0, 0);
      end.setUTCHours(23, 59, 59, 9999);
      this._checkIns = await sp.web.lists.getByTitle(Tables.COVIDCHECKINLIST).items
        .top(5000)
        .select("Id, Title, EmployeeId, Employee/Id, Employee/Title, Employee/EMail, Guest, CheckInOffice, Questions, SubmittedOn, CheckIn, CheckInById, CheckInBy/Id, CheckInBy/Title, CheckInBy/EMail, Created")
        .filter(`(SubmittedOn gt '${start.toISOString()}') and (SubmittedOn lt '${end.toISOString()}')`)
        .expand("Employee, CheckInBy")
        .get<ICheckIns[]>();

      forEach(this._checkIns, (ci) => {
        Object.getOwnPropertyNames(ci).forEach(prop => {
          if (this.JSONDATEFIELDS.indexOf(prop) > -1 && ci[prop] != null) {
            ci[prop] = new Date(ci[prop]);
          } else if (this.JSONFIELDS.indexOf(prop) > -1) {
            ci[`${prop}Value`] = JSON.parse(ci[prop]);
          }
        });
      });

      await this._updateIPerson(this._checkIns);

      this._currentDate = d;
      if (typeof this._checkInsRefresh == "function") {
        this._checkInsRefresh(d);
      }
      retVal = true;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (getCheckIns) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  public moveSelfCheckIns(): Promise<boolean> {
    return new Promise(async (resolve) => {
      try {
        //Get Self CheckIns
        const selfCheckIns = await sp.web.lists.getByTitle(Tables.SELFCHECKINLIST).items
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
            p.push(sp.web.lists.getByTitle(Tables.COVIDCHECKINLIST).items.inBatch(batch).add(checkInLI));
            pd.push(sp.web.lists.getByTitle(Tables.SELFCHECKINLIST).items.getById(sci.Id).inBatch(batchDelete).delete());
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
        Logger.write(`${this.LOG_SOURCE} (moveSelfCheckIns) - ${err.message}`, LogLevel.Error);
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
      const addCheckIn = await sp.web.lists.getByTitle(Tables.COVIDCHECKINLIST).items.add(checkInLI);
      if (addCheckIn.item) {
        retVal = true;
        this.getCheckIns(this._currentDate);
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (addCheckIn) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  public async adminCheckIn(checkIn: ICheckIns): Promise<boolean> {
    let retVal: boolean = false;
    try {
      const data = { CheckIn: checkIn.CheckIn, CheckInById: checkIn.CheckInById };
      const updateCheckIn = await sp.web.lists.getByTitle(Tables.COVIDCHECKINLIST).items.getById(checkIn.Id).update(data);
      if (updateCheckIn.item) {
        retVal = true;
        let ci = find(this._checkIns, { Id: checkIn.Id });
        ci.CheckIn = checkIn.CheckIn;
        ci.CheckInById = checkIn.CheckInById;
        let idxCIB = findIndex(this._users, { Id: ci.CheckInById });
        if (idxCIB < 0) {
          idxCIB = await this._loadUserData(ci.CheckInBy);
        }
        if (idxCIB > -1) {
          ci.CheckInBy = this._users[idxCIB];
        }
        if (typeof this._checkInsRefresh == "function") {
          this._checkInsRefresh(this._currentDate);
        }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (adminCheckIn) - ${err.message}`, LogLevel.Error);
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
      const addSelfCheckIn = await sp.web.lists.getByTitle(Tables.SELFCHECKINLIST).items.add(selfCheckInLI);
      if (addSelfCheckIn.item)
        retVal = true;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (addSelfCheckIn) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  public async searchCheckIn(query: IQuery): Promise<lodash.Dictionary<ICheckIns[]>> {
    let retVal: lodash.Dictionary<ICheckIns[]> = null;
    try {
      let filter = [];
      if (query.person != null) {
        if ((typeof query.person) == "string") {
          filter.push(`(Guest eq '${query.person}')`);
        } else {
          filter.push(`(EmployeeId eq ${query.person})`);
        }
      }
      if (query.startDate != null) {
        const start: Date = cloneDeep(query.startDate);
        start.setUTCHours(0, 0, 0, 0);
        filter.push(`(CheckIn gt '${start.toISOString()}')`);

      }
      if (query.endDate != null) {
        const end: Date = cloneDeep(query.endDate);
        end.setUTCHours(23, 59, 59, 9999);
        filter.push(`(CheckIn lt '${end.toISOString()}')`);
      }
      if (query.office != null && query.office.length > 0) {
        filter.push(`(CheckInOffice eq '${query.office}')`);
      }
      const filterString = filter.join(" and ");
      const checkIns = await sp.web.lists.getByTitle(Tables.COVIDCHECKINLIST).items
        .top(5000)
        .select("Id, Title, EmployeeId, Employee/Id, Employee/Title, Employee/EMail, Guest, CheckInOffice, Questions, SubmittedOn, CheckIn, CheckInById, CheckInBy/Id, CheckInBy/Title, CheckInBy/EMail, Created")
        .filter(filterString)
        .expand("Employee, CheckInBy")
        .orderBy("CheckIn", false)
        .get<ICheckIns[]>();

      forEach(checkIns, (ci) => {
        Object.getOwnPropertyNames(ci).forEach(prop => {
          if (this.JSONDATEFIELDS.indexOf(prop) > -1 && ci[prop] != null) {
            ci[prop] = new Date(ci[prop]);
          } else if (this.JSONFIELDS.indexOf(prop) > -1) {
            ci[`${prop}Value`] = JSON.parse(ci[prop]);
          }
        });
      });

      await this._updateIPerson(checkIns);

      retVal = groupBy(checkIns, (ci) => { return ci.CheckIn.toLocaleDateString(); });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (searchCheckIn) - ${err} - `, LogLevel.Error);
    }
    return retVal;
  }

  public async traceCheckIn(query: IQuery, person: string | number): Promise<lodash.Dictionary<ICheckIns[]>> {
    let retVal: lodash.Dictionary<ICheckIns[]> = null;

    try {
      const searchResults = await cs.searchCheckIn(query);

      for (let key in searchResults) {
        let value = searchResults[key];
        let include = false;
        if (value.length > 0) {

          forEach(value, (p) => {
            if (p.Employee == null) {
              if (p.Guest === person) {
                include = true;
              }
            } else {
              if (p.Employee.Id === person) {
                include = true;
              }

            }
          });
        }
        if (!include) {
          delete searchResults[key];
        }
      }

      retVal = searchResults;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (searchCheckIn) - ${err} - `, LogLevel.Error);
    }
    return retVal;
  }

  public async getSiteUsers(): Promise<IPerson[]> {
    let retVal: IPerson[] = [];
    try {
      const siteUsers = await sp.web.siteUsers();
      forEach(siteUsers, (su) => {
        //if (su.LoginName.indexOf("i:0#.f|membership") > -1)
        if (su.Email?.length > 0)
          retVal.push(new Person(su.Id, su.Title, su.Email));
      });
      await this._updateIPerson(retVal);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (getSiteUsers) - ${err} - `, LogLevel.Error);
    }
    return retVal;
  }
}

export const cs = new CovidService();