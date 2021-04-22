import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";
import { sp } from "@pnp/sp";

export interface IWorldClockConfigureService {
  Valid: boolean;
  isValid: () => Promise<boolean>;
  configure: () => Promise<boolean>;
}

export class WorldClockConfigureService implements IWorldClockConfigureService {
  private LOG_SOURCE: string = "🔶WorldClockConfigureService";

  private _valid: boolean = false;

  constructor() { }

  get Valid(): boolean {
    return this._valid;
  }

  public async isValid(): Promise<boolean> {
    try {
      //const list = await sp.web.lists.getByTitle(Tables.COVIDCHECKINLIST)();
      this._valid = true;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (isValid) - World Clock has not been configured.`, LogLevel.Error);
    }
    return this._valid;
  }

  public async configure(): Promise<boolean> {
    try {
      // const siteVisitorsPermissions = await this._getRoleInformation();
      // const successLocations = await this._createList(Tables.LOCATIONLIST, []);
      // const successQuestions = await this._createList(Tables.QUESTIONLIST, QUESTIONLISTFields);
      // const successSelfCheckin = await this._createList(Tables.SELFCHECKINLIST, SELFCHECKINLISTFields);
      // if (successSelfCheckin) {
      //   await successSelfCheckin.breakRoleInheritance(true);
      //   if (siteVisitorsPermissions.length > 0) {
      //     await successSelfCheckin.roleAssignments.getById(siteVisitorsPermissions[0]).delete();
      //     await successSelfCheckin.roleAssignments.add(siteVisitorsPermissions[0], siteVisitorsPermissions[1]);
      //   } else {
      //     Logger.write(`${this.LOG_SOURCE} (configure) - SelfCheckIn list created but permissions could not be set.`, LogLevel.Error);
      //     return false;
      //   }
      // }
      // const successCheckin = await this._createList(Tables.COVIDCHECKINLIST, COVIDCHECKINLISTFields);
      // if (successCheckin) {
      //   await successCheckin.breakRoleInheritance(true);
      //   if (siteVisitorsPermissions.length > 0) {
      //     await successCheckin.roleAssignments.getById(siteVisitorsPermissions[0]).delete();
      //   } else {
      //     Logger.write(`${this.LOG_SOURCE} (configure) - CovidCheckIn list created but permissions could not be set.`, LogLevel.Error);
      //     return false;
      //   }
      // }
      // this._valid = (successCheckin != null && successLocations != null && successQuestions != null && successSelfCheckin != null);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (configure) - ${err} - `, LogLevel.Error);
    }
    return this._valid;
  }
}

export const wcc = new WorldClockConfigureService();