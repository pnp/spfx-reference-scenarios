import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";
import { sp } from "@pnp/sp";
import { graph } from "@pnp/graph";
import { IConfig, IPerson } from "../models/wc.models";

export interface IWorldClockService { }

export class WorldClockService implements IWorldClockService {
  private LOG_SOURCE: string = "🔶WorldClockService";

  private _ready: boolean = false;
  private _locale: string = "us";
  private _currentIANATimezone: string;
  private _currentConfig: IConfig = null;
  private _currentTeam: IPerson[] = [];

  constructor() {
    this._currentIANATimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  public get Ready(): boolean {
    return this._ready;
  }

  public get Locale(): string {
    return this._locale;
  }

  public get IANATimezone(): string {
    return this._currentIANATimezone;
  }

  public get Config(): IConfig {
    return this._currentConfig;
  }

  public get Team(): IPerson[] {
    return this._currentTeam;
  }

  public async init(locale: string): Promise<void> {
    try {
      this._locale = locale.substr(0, 2);
      await this._getConfig();
      await this._getTeamUsers();
      this._ready = true;
      // let success: boolean[] = [];
      // success.push(await this._getLocations());
      // success.push(await this._getQuestions());
      // if (success.indexOf(false) == -1) {
      //   this._ready = true;
      // }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (init) - ${err.message}`, LogLevel.Error);
    }
  }

  private async _getConfig(): Promise<void> {
    try {
      //TODO: Remove Mock
      this._currentConfig = require("../mocks/config.json");

    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_getConfig) - ${err} - `, LogLevel.Error);
    }
  }

  private async _getTeamUsers(): Promise<void> {
    //TODO: Remove Mock
    this._currentConfig = require("../mocks/team.json");
  }

  private async _searchUsers(): Promise<void> {

  }
}

export const wc = new WorldClockService();