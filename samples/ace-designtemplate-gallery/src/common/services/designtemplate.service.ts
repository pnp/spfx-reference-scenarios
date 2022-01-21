import { cloneDeep, find } from "@microsoft/sp-lodash-subset";
import { Logger, LogLevel } from "@pnp/logging";
import { App, AppData, BenefitDetails, Benefits, LinkData, AppList } from "../models/designtemplate.models";

export interface IDesignTemplateGalleryService {
  Ready: boolean;
  TeamsUrl: string;
  HandleExecuteDeepLink: (linkUrl: string) => void;
  Init(): void;
  ExecuteDeepLink(meetingUrl: string);
  GetBenefits(): App;
  GetAllApps: () => AppData[];
  GetAppData: (linkdata: LinkData) => AppData;
}

export class DesignTemplateGalleryService implements IDesignTemplateGalleryService {
  private LOG_SOURCE: string = "🔶 ACE Design Template Service";
  private _ready: boolean = false;
  private _teamsUrl: string = "https://teams.microsoft.com/l/entity/4a007f51-abb1-4d3a-b753-7c84404936b2/com.acedesigntemplate.spfx";
  private _siteUrl: string;
  private _executeDeepLink: (linkUrl: string) => void;

  constructor() {
  }

  public get Ready(): boolean {
    return this._ready;
  }
  public get TeamsUrl(): string {
    return this._teamsUrl;
  }
  public set HandleExecuteDeepLink(value: (linkUrl: string) => void) {
    this._executeDeepLink = value;
  }

  public ExecuteDeepLink(linkUrl: string): void {
    if (typeof this._executeDeepLink == "function") {
      this._executeDeepLink(linkUrl);
    }
  }

  public Init() {
    try {
      this._ready = true;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (init) - ${err.message}`, LogLevel.Error);
    }
  }

  public GetAllApps(): AppData[] {
    let retVal: AppData[] = [];
    try {
      for (const item in AppList) {
        const app: App = require(`../data/${item.toLocaleLowerCase()}.data.json`);
        retVal.push(app.appData);
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetAllApps) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  public GetBenefits(): App {
    let retVal: App = new App();
    try {
      //Sample pulls data from mock
      //To extend pull data from a list of your items
      retVal = require("../data/benefits.data.json");

      //We need to manipulate the data for the deep link to Teams.
      let details: BenefitDetails[] = cloneDeep(retVal.cardData.details);
      details.map((item) => {
        if (item.isTeamsDeepLink) {
          const url = encodeURI(`${this._teamsUrl}?context={"subEntityId":{"appName":"${AppList.BENEFITS}","linkGUID":"${item.guid}"}}`);
          item.linkUrl = url;
        }
      });
      retVal.cardData.details = details;

    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetBenefits) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  public GetAppData(linkdata: LinkData): AppData {
    let retVal: AppData = new AppData();
    try {
      switch (linkdata.appName) {
        case AppList.BENEFITS: {
          const data: App = this.GetBenefits();
          retVal = data.appData;
          const link: any = find(data.cardData.details, { guid: linkdata.linkGUID });
          if (link) {
            retVal.linkTitle = link.linkText;
          }
          break;
        }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetApData) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }
}



export const dtg = new DesignTemplateGalleryService();