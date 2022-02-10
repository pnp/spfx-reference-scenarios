import { cloneDeep, find } from "@microsoft/sp-lodash-subset";
import { Logger, LogLevel } from "@pnp/logging";
import { App, AppData, BenefitDetails, AppList, EventRegistration, DeepLinkType, DeepLinkData, InventoryItem } from "../models/designtemplate.models";

export interface IDesignTemplateGalleryService {
  Ready: boolean;
  TeamsUrl: string;
  HandleExecuteDeepLink: (linkUrl: string) => void;
  ExecuteDeepLink(meetingUrl: string);
  Init(): void;
  GetAllApps: () => AppData[];
  GetAppData: (linkdata: any) => AppData;
  GetBenefits(): App;
  GetEvents(): App;
  GetEventRegistrationLink(eventRegistration: EventRegistration): string;
  GetFAQs(): App;
  SubmitFAQ(message: string): App;
  GetImageCarousel(): App;
  GetInventoryDetail(): App;
}

export class DesignTemplateGalleryService implements IDesignTemplateGalleryService {
  private LOG_SOURCE: string = "🔶 ACE Design Template Service";
  private _ready: boolean = false;
  private _teamsUrl: string = "https://teams.microsoft.com/l/entity/4a007f51-abb1-4d3a-b753-7c84404936b2/com.acedesigntemplate.spfx";
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

  public GetAppData(linkdata: any): AppData {
    let retVal: AppData = new AppData();
    try {
      switch (linkdata.appName) {
        case AppList.BENEFITS: {
          const data: App = this.GetBenefits();
          retVal = data.appData;
          const link: any = find(data.cardData.details, { guid: linkdata.linkGUID });
          if (link) {
            retVal.deepLinkData = new DeepLinkData(DeepLinkType.TEXT, link.linkText);
          }
          break;
        }
        case AppList.EVENTSCHEDULE: {
          const data: App = this.GetEvents();
          retVal = data.appData;
          const registration: EventRegistration = linkdata.registration;
          if (registration) {
            retVal.deepLinkData = new DeepLinkData(DeepLinkType.EVENTREGISTRATION, null, registration);
          }
          break;
        }
        case AppList.FAQACCORDION: {
          const data: App = this.GetFAQs();
          retVal = data.appData;
          const linkText: string = linkdata.message;
          if (linkText) {
            retVal.deepLinkData = new DeepLinkData(DeepLinkType.TEXT, linkText);
          }
          break;
        }
        case AppList.INVENTORY: {
          const data: App = this.GetInventoryDetail();
          retVal = data.appData;
          const inventoryItem: any = find(data.cardData.inventoryItems, { id: linkdata.linkGUID });
          if (inventoryItem) {
            retVal.deepLinkData = new DeepLinkData(DeepLinkType.INVENTORYITEM, null, null, inventoryItem);
          }
          break;
        }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetApData) - ${err.message}`, LogLevel.Error);
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

  public GetEvents(): App {
    let retVal: App = new App();
    try {
      //Sample pulls data from mock
      //To extend pull data from a list of your items
      retVal = require("../data/eventschedule.data.json");
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetEvents) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  public GetEventRegistrationLink(registration: EventRegistration): string {
    let retVal: string = "";
    try {
      //In a real world scenario you would use this method to save the 
      //save data into the system of record.
      //Here we are going to link to the Teams App and demonstrate deep linking
      retVal = encodeURI(`${this._teamsUrl}?context={"subEntityId":{"appName":"${AppList.EVENTSCHEDULE}","registration":${JSON.stringify(registration)}}}`);

    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetEventRegistrationLink) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  public GetFAQs(): App {
    let retVal: App = new App();
    try {
      //Sample pulls data from mock
      //To extend pull data from a list of your items
      retVal = require("../data/faqaccordion.data.json");
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetFAQs) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  public SubmitFAQ(message: string): App {
    let retVal: App = new App();
    try {
      const url = encodeURI(`${this._teamsUrl}?context={"subEntityId":{"appName":"${AppList.FAQACCORDION}","message":"${message}"}}`);
      window.open(url);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetFAQs) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  public GetImageCarousel(): App {
    let retVal: App = new App();
    try {
      //Sample pulls data from mock
      //To extend pull data from a list of your items
      retVal = require("../data/imagecarousel.data.json");
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetImageCarousel) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  public GetInventoryDetail(): App {
    let retVal: App = new App();
    try {
      //Sample pulls data from mock
      //To extend pull data from a list of your items
      retVal = require("../data/inventory.data.json");
      //We need to manipulate the data for the deep link to Teams.
      let inventoryItems: InventoryItem[] = cloneDeep(retVal.cardData.inventoryItems);
      inventoryItems.map((item) => {
        const url = encodeURI(`${this._teamsUrl}?context={"subEntityId":{"appName":"${AppList.INVENTORY}","linkGUID":"${item.id}"}}`);
        item.linkUrl = url;
      });
      retVal.cardData.inventoryItems = inventoryItems;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetInventoryDetail) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }




}



export const dtg = new DesignTemplateGalleryService();