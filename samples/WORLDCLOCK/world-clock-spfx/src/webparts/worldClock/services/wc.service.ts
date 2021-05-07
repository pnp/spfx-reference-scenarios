import { Logger, LogLevel } from "@pnp/logging";
import { sp } from "@pnp/sp";
import { graph, graphGet, GraphQueryable } from "@pnp/graph";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items/list";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import "@pnp/graph/users";
import "@pnp/graph/onedrive";
import "@pnp/graph/groups";

import { DateTime, IANAZone } from "luxon";
import { findIana } from 'windows-iana';
import { find, merge, forEach, findIndex } from "lodash";

import { IConfig, IPerson, Config, CONFIG_TYPE, Person, PERSON_TYPE } from "../models/wc.models";
import { IDriveItem } from "@pnp/graph/onedrive";
import { WorldClockMemberService } from "./wcMember.service";
export interface IWorldClockService { }

export class WorldClockService implements IWorldClockService {
  private LOG_SOURCE: string = "🔶WorldClockService";

  private _ready: boolean = false;
  private _configType: CONFIG_TYPE = CONFIG_TYPE.Team;
  private _userLogin: string = "";
  private _siteUrl: string = "";
  private _locale: string = "us";
  private _configDriveId: string = "";
  private _configItemId: string = "";
  private _groupId: string = "2832d349-ef5e-4a71-b780-5b663d151890";
  private _currentIANATimeZone: string;
  private _currentConfig: IConfig = null;
  private _currentTeam: IPerson[] = [];

  constructor() {
    this._currentIANATimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  public get Ready(): boolean {
    return this._ready;
  }

  public get UserLogin(): string {
    return this._userLogin;
  }

  public get Locale(): string {
    return this._locale;
  }

  public get IANATimeZone(): string {
    return this._currentIANATimeZone;
  }

  public get ConfigType(): CONFIG_TYPE {
    return this._configType;
  }

  public get Config(): IConfig {
    return this._currentConfig;
  }

  public get GroupId(): string {
    return this._groupId;
  }

  public get Team(): IPerson[] {
    return this._currentTeam;
  }

  public get CurrentUser(): IPerson {
    if (this._configType === CONFIG_TYPE.Team) {
      const currentUser = find(this._currentConfig.members, { userPrincipal: this._userLogin });
      return currentUser;
    } else {
      return this._currentConfig.configPerson;
    }
  }

  public async init(loginName: string, locale: string, siteUrl: string, groupId: string, configType: CONFIG_TYPE): Promise<void> {
    try {
      this._userLogin = loginName;
      this._siteUrl = siteUrl;
      this._locale = locale.substr(0, 2);
      this._configType = configType;
      await this._getConfig();
      this._ready = true;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (init) - ${err.message}`, LogLevel.Error);
    }
  }

  private async _getConfigId(): Promise<void> {
    try {
      const drives = await graph.me.drives.get();
      if (drives?.length > 0) {
        this._configDriveId = drives[0].id;
        const itemChildren: IDriveItem[] = await graph.me.drives.getById(this._configDriveId).root.search("worldclockconfig.json");
        if (itemChildren?.length > 0) {
          this._configItemId = itemChildren[0]["id"];
        }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_getConfigId) - ${err} - `, LogLevel.Error);
    }
  }

  private async _getConfig(): Promise<void> {
    try {
      if (this._configType === CONFIG_TYPE.Team) {
        this._currentConfig = await sp.web.getFileByServerRelativeUrl(`${this._siteUrl}/SiteAssets/worldclockconfig.json`).getJSON();
      } else {
        await this._getConfigId();
        if (this._configItemId?.length > 0) {
          const configBlob = await await graph.me.drives.getById(this._configDriveId).getItemById(this._configItemId).getContent();
          const configStream = await configBlob.stream().getReader().read();
          if (configStream.done) {
            this._currentConfig = configStream.value();
          }
        }
      }

      const wcm = new WorldClockMemberService();
      if (this._currentConfig == undefined) {
        this._currentConfig = await wcm.GenerateConfig();
      } else {
        wcm.UpdateTimezones(this._currentConfig.members).then((hasUpdate) => {
          //Trigger refresh
        });
      }

      //Validate Team Members Offsets
      if (this._currentConfig.members?.length > 0) {
        const now = DateTime.utc().millisecond;
        forEach(this._currentConfig.members, (o) => {
          if (o.IANATimeZone?.length > 0) {
            o.offset = IANAZone.create(o.IANATimeZone).offset(now);
          }
        });
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_getConfig) - ${err} - `, LogLevel.Error);
    }
  }


  public async updateConfig(config: IConfig): Promise<boolean> {
    let retVal: boolean = false;
    try {
      const serverRelUrl = await sp.web.select("ServerRelativeUrl")();
      let configFile = await sp.web.getFileByServerRelativeUrl(serverRelUrl.ServerRelativeUrl + "/SiteAssets/config.json").setContent(JSON.stringify(config));
      if (configFile.data)
        retVal = true;
      this._currentConfig = config;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (addCheckIn) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  private async _searchUsers(): Promise<void> {

  }
}

export const wc = new WorldClockService();