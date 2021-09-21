import { Logger, LogLevel } from "@pnp/logging";
import { Article, ILocation, Image, Tables, Task, TaskList, Tweet } from "../models/cg.models";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import { IWeb, Web } from "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items/list";
import "@pnp/sp/search";
import { ISearchQuery, SearchResults, SearchQueryBuilder } from "@pnp/sp/search";


export interface ICardGalleryService {
  Ready: boolean;
  HandleExecuteDeepLink: (meetingUrl: string) => void;
  Init(locale: string): Promise<void>;
  ExecuteDeepLink(meetingUrl: string);
  GetLocations(): ILocation[];
  GetImages(): Image[];
  GetArticles(): Article[];
  GetTweets(): Tweet[];
  GetTasks(): TaskList;
}

export class CardGalleryService implements ICardGalleryService {
  private LOG_SOURCE: string = "🔶 CardGalleryService";
  private _ready: boolean = false;
  private _siteUrl: string;
  private _executeDeepLink: (meetingUrl: string) => void;

  constructor() {
  }

  public get Ready(): boolean {
    return this._ready;
  }
  public set HandleExecuteDeepLink(value: (meetingUrl: string) => void) {
    this._executeDeepLink = value;
  }

  public async Init(siteUrl: string): Promise<void> {
    try {
      this._siteUrl = siteUrl;
      // await this._getConfig();
      this._ready = true;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (init) - ${err.message}`, LogLevel.Error);
    }
  }

  public GetLocations(): ILocation[] {
    let retVal: ILocation[] = [];
    try {
      //Sample pulls data from mock
      //To extend pull data from a list of your locations
      retVal = require("../mocks/locationsConfig.json");
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetLocations) - ${err} - `, LogLevel.Error);
    }
    return retVal;
  }

  public GetImages(): Image[] {
    let retVal: Image[] = [];
    try {
      retVal = require("../mocks/imageRotatorConfig.json");
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetImages) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }
  public GetArticles(): Article[] {
    let retVal: Article[] = [];
    try {
      retVal = require("../mocks/companyNewsConfig.json");
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetArticles) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }
  public GetTweets(): Tweet[] {
    let retVal: Tweet[] = [];
    try {
      retVal = require("../mocks/twitterCardConfig.json");
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetTweets) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }
  public GetTasks(): TaskList {
    let retVal: TaskList = new TaskList();
    try {
      retVal = require("../mocks/taskListConfig.json");
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetTasks) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  public ExecuteDeepLink(meetingUrl: string): void {
    if (typeof this._executeDeepLink == "function") {
      this._executeDeepLink(meetingUrl);
    }
  }

}

export const cg = new CardGalleryService();