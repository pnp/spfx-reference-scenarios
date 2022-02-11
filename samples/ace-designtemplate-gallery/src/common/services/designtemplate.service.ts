import { cloneDeep, find } from "@microsoft/sp-lodash-subset";
import { Logger, LogLevel } from "@pnp/logging";
import * as strings from "AceDesignTemplatePersonalAppWebPartStrings";
import * as eventStrings from "EventscheduleAdaptiveCardExtensionStrings";
import * as faqStrings from "FaqaccordionAdaptiveCardExtensionStrings";
import { App, AppData, BenefitDetails, AppList, EventRegistration, DeepLinkType, InventoryItem, DeepLinkData, Benefits, AccordionList, Event, FAQ, IFAQ, ImageCarousel } from "../models/designtemplate.models";

export interface IDesignTemplateGalleryService {
  Ready: boolean;
  TeamsUrl: string;
  HandleExecuteDeepLink: (linkUrl: string) => void;
  ExecuteDeepLink(meetingUrl: string);
  Init(): void;
  GetAllApps: () => AppData[];
  GetAppData: (linkdata: any) => AppData;
  GetBenefits(): Benefits;
  GetEvents(): Event;
  GetEventRegistrationLink(eventRegistration: EventRegistration): string;
  GetFAQs(): AccordionList;
  SubmitFAQ(message: string): void;
  GetImageCarousel(): ImageCarousel;
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
        retVal.push(this.GetAppData(AppList[item]));
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetAllApps) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  public GetAppData(appName: AppList): AppData {
    let retVal: AppData = new AppData();
    try {
      switch (appName) {
        case AppList.BENEFITS: {
          retVal.appCardImage = require('../images/benefits/dashboard-card.png');
          retVal.appQuickViewImage = require('../images/benefits/card.png');
          retVal.appName = strings.BenefitsAppName;
          retVal.appDescription = strings.BenefitsAppDesc;
          break;
        }
        case AppList.EVENTSCHEDULE: {
          retVal.appCardImage = require('../images/event-schedule/dashboard-card.png');
          retVal.appQuickViewImage = require('../images/event-schedule/card.png');
          retVal.appName = strings.EventScheduleAppName;
          retVal.appDescription = strings.EventScheduleAppDesc;
          break;
        }
        case AppList.FAQACCORDION: {
          retVal.appCardImage = require('../images/faq-accordion/dashboard-card.png');
          retVal.appQuickViewImage = require('../images/faq-accordion/card.png');
          retVal.appName = strings.FAQAppName;
          retVal.appDescription = strings.FAQAppDesc;
          break;
        }
        case AppList.IMAGECAROUSEL: {
          retVal.appCardImage = require('../images/image-carousel/dashboard-card.png');
          retVal.appQuickViewImage = require('../images/image-carousel/card.png');
          retVal.appName = strings.ImageCarouselAppName;
          retVal.appDescription = strings.ImageCarouselAppDesc;
          break;
        }
        // case AppList.INVENTORY: {
        //   appData.appName = strings.BenefitsAppName;
        //   appData.appDescription = strings.BenefitsAppDesc;
        //   break;
        // }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetAllApps) - ${err.message}`, LogLevel.Error);
    }

    return retVal;
  }

  public GetDeepLinkData(subEntityId: any): DeepLinkData {
    let retVal: DeepLinkData = new DeepLinkData();
    try {
      retVal.appName = subEntityId.appName;
      switch (subEntityId.appName) {
        case AppList.BENEFITS: {
          const benefits: Benefits = this.GetBenefits();
          const link: BenefitDetails = find(benefits.details, { id: subEntityId.message });
          retVal = new DeepLinkData(subEntityId.appName, DeepLinkType.TEXT, link.linkText);
          break;
        }
        case AppList.EVENTSCHEDULE: {
          const registration: EventRegistration = subEntityId.message;
          if (registration) {
            retVal.message = registration;
          }
          retVal = new DeepLinkData(subEntityId.appName, DeepLinkType.EVENTREGISTRATION, registration);
          break;
        }
        case AppList.FAQACCORDION: {
          retVal = new DeepLinkData(subEntityId.appName, DeepLinkType.TEXT, subEntityId.message);
          break;
        }
        default: {
          //statements; 
          break;
        }
      }
    }
    catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetDeepLinkData) - ${err.message}`, LogLevel.Error);
    }

    return retVal;
  }

  public GetAppDataold(linkdata: any): AppData {
    let retVal: AppData = new AppData();
    // try {
    //   switch (linkdata.appName) {
    //     case AppList.BENEFITS: {
    //       const data: App = this.GetBenefits();
    //       retVal = data.appData;
    //       const link: any = find(data.cardData.details, { guid: linkdata.linkGUID });
    //       if (link) {
    //         retVal.deepLinkData = new DeepLinkData(DeepLinkType.TEXT, link.linkText);
    //       }
    //       break;
    //     }
    //     case AppList.EVENTSCHEDULE: {
    //       const data: App = this.GetEvents();
    //       retVal = data.appData;
    //       const registration: EventRegistration = linkdata.registration;
    //       if (registration) {
    //         retVal.deepLinkData = new DeepLinkData(DeepLinkType.EVENTREGISTRATION, null, registration);
    //       }
    //       break;
    //     }
    //     // case AppList.FAQACCORDION: {
    //     //   const data: App = this.GetFAQs();
    //     //   retVal = data.appData;
    //     //   const linkText: string = linkdata.message;
    //     //   if (linkText) {
    //     //     retVal.deepLinkData = new DeepLinkData(DeepLinkType.TEXT, linkText);
    //     //   }
    //     //   break;
    //     // }
    //     // case AppList.INVENTORY: {
    //     //   const data: App = this.GetInventoryDetail();
    //     //   retVal = data.appData;
    //     //   const inventoryItem: any = find(data.cardData.inventoryItems, { id: linkdata.linkGUID });
    //     //   if (inventoryItem) {
    //     //     retVal.deepLinkData = new DeepLinkData(DeepLinkType.INVENTORYITEM, null, null, inventoryItem);
    //     //   }
    //     //   break;
    //     // }
    //   }
    // } catch (err) {
    //   Logger.write(`${this.LOG_SOURCE} (GetApData) - ${err.message}`, LogLevel.Error);
    // }
    return retVal;
  }

  public GetBenefits(): Benefits {
    let retVal: Benefits = new Benefits();
    try {
      //Sample pulls data from mock
      //To extend pull data from a list of your items
      retVal = require("../data/benefits.data.json");

      //We need to manipulate the data for the deep link to Teams.
      let details: BenefitDetails[] = cloneDeep(retVal.details);
      details.map((item) => {
        if (item.isTeamsDeepLink) {
          const url = encodeURI(`${this._teamsUrl}?context={"subEntityId":{"appName":"${AppList.BENEFITS}","linkType":"${DeepLinkType.TEXT}","message":"${item.id}"}}`);
          item.linkUrl = url;
        }
      });
      retVal.details = details;

    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetBenefits) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  public GetEvents(): Event {
    let retVal: Event = new Event();
    try {
      //Sample pulls data from mock
      //To extend pull data from a list of your items
      retVal = require("../data/eventschedule.data.json");
      //Lets set some event specific data
      //This would come out of our event management system
      retVal.cardViewImage = require('../images/event-schedule/events.png');
      retVal.eventTitle = eventStrings.EventTitle;
      retVal.headline = eventStrings.ScheduleHeading;
      retVal.imageCaption = eventStrings.ImageCaption;
      retVal.introContent = eventStrings.IntroContent;
      retVal.mainImage = require('../images/event-schedule/Ignite-2021-fall-trim.gif');

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
      retVal = encodeURI(`${this._teamsUrl}?context={"subEntityId":{"appName":"${AppList.EVENTSCHEDULE}","linkType":"${DeepLinkType.EVENTREGISTRATION}","message":${JSON.stringify(registration)}}}`);

    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetEventRegistrationLink) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  public GetFAQs(): AccordionList {
    let retVal: AccordionList = new AccordionList();
    try {
      //Sample pulls data from mock
      //To extend pull data from a list of your items
      retVal = require("../data/faqaccordion.data.json");
      //Lets set some specific data
      //This would come out of our knowledge management system
      retVal.mainImage = require('../images/faq-accordion/officelogo.png');
      retVal.title = faqStrings.FAQTitle;
      retVal.imageCaption = faqStrings.ImageCaption;
      retVal.introContent = faqStrings.IntroContent;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetFAQs) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  public SubmitFAQ(message: string): void {
    try {
      const url = encodeURI(`${this._teamsUrl}?context={"subEntityId":{"appName":"${AppList.FAQACCORDION}","linkType":"${DeepLinkType.TEXT}","message":"${message}"}}`);
      window.open(url);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetFAQs) - ${err.message}`, LogLevel.Error);
    }
  }

  public GetImageCarousel(): ImageCarousel {
    let retVal: ImageCarousel = new ImageCarousel();
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
        //const url = encodeURI(`${this._teamsUrl}?context={"subEntityId":{"appName":"${AppList.INVENTORY}","linkGUID":"${item.id}"}}`);
        //item.linkUrl = url;
      });
      retVal.cardData.inventoryItems = inventoryItems;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetInventoryDetail) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }




}



export const dtg = new DesignTemplateGalleryService();