import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";
import { sp } from "@pnp/sp";
import { graph } from "@pnp/graph";
import { IConfig, IPerson } from "../models/wc.models";
import { Web } from "@pnp/sp/webs";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items/list";
import { IItemAddResult } from "@pnp/sp/items/types";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import { DateTime } from "luxon";
import { find, merge } from "lodash";

export interface IWorldClockService { }

export class WorldClockService implements IWorldClockService {
  private LOG_SOURCE: string = "🔶WorldClockService";

  private _ready: boolean = false;
  private _userLogin: string = "";
  private _siteUrl: string = "";
  private _locale: string = "us";
  private _currentIANATimeZone: string;
  private _currentConfig: IConfig = null;
  private _currentTeam: IPerson[] = [];

  constructor() {
    this._currentIANATimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  public get Ready(): boolean {
    return this._ready;
  }

  public get Locale(): string {
    return this._locale;
  }

  public get IANATimeZone(): string {
    return this._currentIANATimeZone;
  }

  public get Config(): IConfig {
    return this._currentConfig;
  }

  public get Team(): IPerson[] {
    return this._currentTeam;
  }

  public async init(loginName: string, locale: string, siteUrl: string): Promise<void> {
    try {
      this._userLogin = loginName;
      this._siteUrl = siteUrl;
      this._locale = locale.substr(0, 2);
      await this._getTeamConfig();
      await this._getTeamUsers();
      this._ready = true;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (init) - ${err.message}`, LogLevel.Error);
    }
  }

  private async _getTeamConfig(): Promise<void> {
    try {
      const teamConfig: IConfig = await sp.web.getFileByServerRelativeUrl(`${this._siteUrl}/SiteAssets/config.json`).getJSON();
      teamConfig.members.map((m) => {
        m.offset = this._getOffset(m.IANATimeZone);
        let member = find(teamConfig.members, { personId: m.personId });
        if (member) {
          merge(member, m);
        }
      });
      this._currentConfig = teamConfig;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_getTeamConfig) - ${err} - `, LogLevel.Error);
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

  private async _getTeamUsers(): Promise<void> {
    //TODO: Remove Mock
    this._currentTeam = require("../mocks/team.json");
  }

  private async _searchUsers(): Promise<void> {

  }

  private _getOffset = (compareTimeZone: string): number => {
    let offset: number = 0;
    try {
      let localTime: DateTime = DateTime.now().setLocale(this._locale).setZone(this._currentIANATimeZone);
      let compareTime: DateTime = localTime.setZone(compareTimeZone);
      offset = (((compareTime.offset) - (localTime.offset)) / 60);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_getOffset) - ${err.message}`, LogLevel.Error);
    }
    return offset;
  }


}

export const wc = new WorldClockService();