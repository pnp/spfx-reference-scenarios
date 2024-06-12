import { cloneDeep, find } from "@microsoft/sp-lodash-subset";
import { PageContext } from "@microsoft/sp-page-context";
import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/fields/list";
import "@pnp/sp/views";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import { IView } from "@pnp/sp/views/types";
import { spfi, SPFI, SPFx } from "@pnp/sp";

import { IListAddResult, ILists } from "@pnp/sp/lists";
import {
  DateTimeFieldFormatType,
  CalendarType,
  DateTimeFieldFriendlyFormatType,
  UrlFieldFormatType
} from "@pnp/sp/fields/types";

import * as strings from "AceDesignTemplatePersonalAppWebPartStrings";
import * as eventStrings from "EventscheduleAdaptiveCardExtensionStrings";
import * as faqStrings from "FaqaccordionAdaptiveCardExtensionStrings";
import {
  AppData, BenefitDetails,
  AppList, EventRegistration,
  DeepLinkType, DeepLinkData,
  Benefits, AccordionList,
  Event, ImageCarousel,
  InventoryDetail, IInventoryItem,
  PayPeriod, Payslip,
  SimpleList, Anniversary,
  Praise, Day,
  Appointment,
  Holiday, HolidayTimeline,
  TimeOff, TimeOffRequest,
  VaccineAppointment, Cafeteria,
  Cuisine,
  HelpDeskTicket,
  IFieldList
} from "../models/designtemplate.models";
import { PermissionKind } from "@pnp/sp/security";
import { IFileAddResult } from "@pnp/sp/files";


export interface IDesignTemplateGalleryService {
  readonly ready: boolean;
  readonly sp: SPFI;
  readonly pageContext: PageContext;
  webUrl: string;
  TeamsUrl: string;
  Init(serviceScope: ServiceScope): Promise<void>;
  GetAllApps: () => AppData[];
  GetAppData: (linkdata: any) => AppData;
  GetDeepLinkData(subEntityId: any, local: string): DeepLinkData;
  GetBenefits(): Benefits;
  GetEvents(): Event;
  GetEventRegistrationLink(eventRegistration: EventRegistration): string;
  GetFAQs(): AccordionList;
  SubmitFAQ(message: string): void;
  GetImageCarousel(): ImageCarousel;
  GetInventoryDetail(): InventoryDetail;
  GetPayPeriods: () => PayPeriod[];
  GetPaySlips: () => Payslip[];
  GetSimpleList(local: string): SimpleList;
  getCalendarDays: (currentDate: Date, local: string) => Day[];
  GetAppointments: (currentDate: Date, local: string) => Appointment[];
  GetThisWeekData: (currentDate: Date, local: string) => Appointment[];
  GetHolidayTimeline: (local: string) => HolidayTimeline;
  GetTimeOff: () => TimeOff;
  SubmitTimeOffRequest: (request: TimeOffRequest) => void;
  SubmitVaccineAppointment: (request: VaccineAppointment) => void;
  GetCafeterias: () => Cafeteria[];
  GetHelpDeskTicketLink(ticket: HelpDeskTicket): string;
  GetHelpDeskTickets: (bingMapsKey: string) => HelpDeskTicket[];
  CloseHelpDeskTickets: (tickets: HelpDeskTicket[], currentTicket: HelpDeskTicket) => HelpDeskTicket[];
  GetLocationData(latitude: string, longitude: string, apiKey: string): Promise<string>;
  GetCurrentLocation(): Promise<any>;
  CheckList(listName: string): Promise<boolean>;
  CanUserUpload(listName: string): Promise<boolean>;
  AddImage(listName: string, fileName: string, fileContents: Uint8Array): Promise<boolean>;
}

export class DesignTemplateGalleryService implements IDesignTemplateGalleryService {
  private LOG_SOURCE = "🔶 ACE Design Template Service";
  public static readonly serviceKey: ServiceKey<DesignTemplateGalleryService> =
    ServiceKey.create<DesignTemplateGalleryService>(
      "DesignTemplateGalleryService:IDesignTemplateGalleryService",
      DesignTemplateGalleryService
    );
  private _sp: SPFI;
  private _pageContext: PageContext;
  private _ready = false;
  private _webUrl = "";
  private _teamsUrl = "https://teams.microsoft.com/l/entity/4a007f51-abb1-4d3a-b753-7c84404936b2/com.acedesigntemplate.spfx";

  public async Init(serviceScope: ServiceScope): Promise<void> {
    try {
      serviceScope.whenFinished(async () => {
        this._pageContext = serviceScope.consume(PageContext.serviceKey);
        this._sp = spfi().using(SPFx({ pageContext: this._pageContext }));
        this._ready = true;
      });
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (init) - ${err}`);
    }
  }

  public get ready(): boolean {
    return this._ready;
  }

  public get sp(): SPFI {
    return this._sp;
  }

  public get pageContext(): PageContext {
    return this._pageContext;
  }

  public get webUrl(): string {
    return this._webUrl;
  }

  public set webUrl(value: string) {
    this._webUrl = value;
    try {
      this._sp = spfi(value).using(SPFx({ pageContext: this._pageContext }));
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (webUrl) - cannot connect to new web - ${err}`
      );
    }
  }
  public get TeamsUrl(): string {
    return this._teamsUrl;
  }


  public GetAllApps(): AppData[] {
    const retVal: AppData[] = [];
    try {
      for (const item in AppList) {
        if (Object.prototype.hasOwnProperty.call(AppList, item)) {
          retVal.push(this.GetAppData(AppList[item]));
        }
      }
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (GetAllApps) -- list of apps not returned. - ${err}`
      );
    }
    return retVal;
  }

  public GetAppData(appName: AppList): AppData {
    const retVal: AppData = new AppData();
    try {
      switch (appName) {
        case AppList.BENEFITS: {
          retVal.appCardImage = require('../images/benefits/dashboard-card.png');
          retVal.appQuickViewImage = require('../images/benefits/card.png');
          retVal.appName = strings.BenefitsAppName;
          retVal.appDescription = strings.BenefitsAppDesc;
          retVal.appDesignerLink = strings.BenefitsAppDesignerLink;
          retVal.appGitHubLink = strings.BenefitsAppGitHubLink;
          break;
        }
        case AppList.EVENTSCHEDULE: {
          retVal.appCardImage = require('../images/event-schedule/dashboard-card.png');
          retVal.appQuickViewImage = require('../images/event-schedule/card.png');
          retVal.appName = strings.EventScheduleAppName;
          retVal.appDescription = strings.EventScheduleAppDesc;
          retVal.appDesignerLink = strings.EventScheduleAppDesignerLink;
          retVal.appGitHubLink = strings.EventScheduleAppGitHubLink;
          break;
        }
        case AppList.FAQACCORDION: {
          retVal.appCardImage = require('../images/faq-accordion/dashboard-card.png');
          retVal.appQuickViewImage = require('../images/faq-accordion/card.png');
          retVal.appName = strings.FAQAppName;
          retVal.appDescription = strings.FAQAppDesc;
          retVal.appDesignerLink = strings.FAQAppDesignerLink;
          retVal.appGitHubLink = strings.FAQAppGitHubLink;
          break;
        }
        case AppList.HELPDESK: {
          retVal.appCardImage = require('../images/helpdesk/ticket-listcard.png');
          retVal.appQuickViewImage = require('../images/helpdesk/incident-details-quick-view.png');
          retVal.appName = strings.HelpDeskAppName;
          retVal.appDescription = strings.HelpDeskAppDesc;
          retVal.appDesignerLink = strings.HelpDeskAppDesignerLink;
          retVal.appGitHubLink = strings.HelpDeskAppGitHubLink;
          break;
        }
        case AppList.HELPDESKCREATE: {
          retVal.appCardImage = require('../images/helpdesk/helpdesk-create-dashboardcard.png');
          retVal.appQuickViewImage = require('../images/helpdesk/create-ticket-quick-view.png');
          retVal.appName = strings.HelpDeskCreateAppName;
          retVal.appDescription = strings.HelpDeskCreateAppDesc;
          retVal.appDesignerLink = strings.HelpDeskCreateAppDesignerLink;
          retVal.appGitHubLink = strings.HelpDeskCreateAppGitHubLink;
          break;
        }
        case AppList.IMAGECAROUSEL: {
          retVal.appCardImage = require('../images/image-carousel/dashboard-card.png');
          retVal.appQuickViewImage = require('../images/image-carousel/card.png');
          retVal.appName = strings.ImageCarouselAppName;
          retVal.appDescription = strings.ImageCarouselAppDesc;
          retVal.appDesignerLink = strings.ImageCarouselAppDesignerLink;
          retVal.appGitHubLink = strings.ImageCarouselAppGitHubLink;
          break;
        }
        case AppList.INVENTORY: {
          retVal.appCardImage = require('../images/inventory/dashboard-card.png');
          retVal.appQuickViewImage = require('../images/inventory/card.png');
          retVal.appName = strings.InventoryAppName;
          retVal.appDescription = strings.InventoryAppDesc;
          retVal.appDesignerLink = strings.InventoryAppDesignerLink;
          retVal.appGitHubLink = strings.InventoryAppGitHubLink;
          break;
        }
        case AppList.PAYSLIP: {
          retVal.appCardImage = require('../images/payslip/dashboard-card.png');
          retVal.appQuickViewImage = require('../images/payslip/card.png');
          retVal.appName = strings.PayslipAppName;
          retVal.appDescription = strings.PayslipAppDesc;
          retVal.appDesignerLink = strings.PayslipAppDesignerLink;
          retVal.appGitHubLink = strings.PayslipAppGitHubLink;
          break;
        }
        case AppList.SIMPLELIST: {
          retVal.appCardImage = require('../images/simple-list/dashboard-card.png');
          retVal.appQuickViewImage = require('../images/simple-list/card.png');
          retVal.appName = strings.SimpleListAppName;
          retVal.appDescription = strings.SimpleListAppDesc;
          retVal.appDesignerLink = strings.SimpleListAppDesignerLink;
          retVal.appGitHubLink = strings.SimpleListAppGitHubLink;
          break;
        }
        case AppList.TEAMCALENDAR: {
          retVal.appCardImage = require('../images/team-calendar/dashboard-card.png');
          retVal.appQuickViewImage = require('../images/team-calendar/card.png');
          retVal.appName = strings.TeamCalendarAppName;
          retVal.appDescription = strings.TeamCalendarAppDesc;
          retVal.appDesignerLink = strings.TeamCalendarAppDesignerLink;
          retVal.appGitHubLink = strings.TeamCalendarAppGitHubLink;
          break;
        }
        case AppList.TIMELINEHOLIDAY: {
          retVal.appCardImage = require('../images/timeline-holidays/dashboard-card.png');
          retVal.appQuickViewImage = require('../images/timeline-holidays/card.png');
          retVal.appName = strings.TimelineAppName;
          retVal.appDescription = strings.TimelineAppDesc;
          retVal.appDesignerLink = strings.TimelineAppDesignerLink;
          retVal.appGitHubLink = strings.TimelineAppGitHubLink;
          break;
        }
        case AppList.TIMEOFF: {
          retVal.appCardImage = require('../images/timeoff/dashboard-card.png');
          retVal.appQuickViewImage = require('../images/timeoff/card.png');
          retVal.appName = strings.TimeoffAppName;
          retVal.appDescription = strings.TimeoffAppDesc;
          retVal.appDesignerLink = strings.TimeoffAppDesignerLink;
          retVal.appGitHubLink = strings.TimeoffAppGitHubLink;
          break;
        }
        case AppList.VACCINATIONBOOSTER: {
          retVal.appCardImage = require('../images/vaccination-booster/dashboard-card.png');
          retVal.appQuickViewImage = require('../images/vaccination-booster/card.png');
          retVal.appName = strings.VaccinationAppName;
          retVal.appDescription = strings.VaccinationAppDesc;
          retVal.appDesignerLink = strings.VaccinationAppDesignerLink;
          retVal.appGitHubLink = strings.VaccinationAppGitHubLink;
          break;
        }
        case AppList.VISUALLIST: {
          retVal.appCardImage = require('../images/visual-list/dashboard-card.png');
          retVal.appQuickViewImage = require('../images/visual-list/card.png');
          retVal.appName = strings.VisualListAppName;
          retVal.appDescription = strings.VisualListAppDesc;
          retVal.appDesignerLink = strings.VisualListAppDesignerLink;
          retVal.appGitHubLink = strings.VisualListAppGitHubLink;
          break;
        }
      }
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (GetAllApps) -- error returning app data. - ${err}`
      );
    }

    return retVal;
  }

  public GetDeepLinkData(subEntityId: any, local: string): DeepLinkData {
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
        case AppList.HELPDESK:
        case AppList.HELPDESKCREATE: {
          retVal = new DeepLinkData(subEntityId.appName, DeepLinkType.HELPDESKTICKET, subEntityId.message);
          break;
        }
        case AppList.INVENTORY: {
          const inventory: InventoryDetail = this.GetInventoryDetail();
          const link: IInventoryItem = find(inventory.inventoryItems, { id: subEntityId.message });
          retVal = new DeepLinkData(subEntityId.appName, DeepLinkType.TEXT, link.name);
          break;
        }
        case AppList.SIMPLELIST: {
          const simpleList: SimpleList = this.GetSimpleList(local);
          if (subEntityId.linkType == DeepLinkType.ANNIVERSARY) {
            const anniversary: Anniversary = find(simpleList.anniversaries, { id: subEntityId.message });
            retVal = new DeepLinkData(subEntityId.appName, DeepLinkType.ANNIVERSARY, anniversary);
          }
          if (subEntityId.linkType == DeepLinkType.PRAISE) {
            const praise: Praise = find(simpleList.praise, { id: subEntityId.message });
            retVal = new DeepLinkData(subEntityId.appName, DeepLinkType.PRAISE, praise);
          }
          break;
        }
        case AppList.TIMEOFF: {
          const request: TimeOff = subEntityId.message;
          retVal = new DeepLinkData(subEntityId.appName, DeepLinkType.TIMEOFFREQUEST, request);
          break;
        }
        case AppList.VACCINATIONBOOSTER: {
          const request: VaccineAppointment = subEntityId.message;
          retVal = new DeepLinkData(subEntityId.appName, DeepLinkType.VACCINATIONBOOSTER, request);
          break;
        }
        case AppList.VISUALLIST: {
          const cafes: Cafeteria[] = this.GetCafeterias();
          const cafe: Cafeteria = find(cafes, { id: "0" });
          const link: Cuisine = find(cafe.cuisine, { id: subEntityId.message });
          retVal = new DeepLinkData(subEntityId.appName, DeepLinkType.TEXT, link.name);
          break;
        }
        default: {
          //statements; 
          break;
        }
      }
    }
    catch (err) {
      console.error(
        `${this.LOG_SOURCE} (GetDeepLinkData) -- error getting deep link to Teams. - ${err}`
      );
    }

    return retVal;
  }

  public GetBenefits(): Benefits {
    let retVal: Benefits = new Benefits();
    try {
      //Sample pulls data from mock
      //To extend pull data from a list of your items
      retVal = require("../data/benefits.data.json");

      //We need to manipulate the data for the deep link to Teams.
      const details: BenefitDetails[] = cloneDeep(retVal.details);
      details.map((item) => {
        if (item.isTeamsDeepLink) {
          const url = encodeURI(`${this._teamsUrl}?context={"subEntityId":{"appName":"${AppList.BENEFITS}","linkType":"${DeepLinkType.TEXT}","message":"${item.id}"}}`);
          item.linkUrl = url;
        }
      });
      retVal.details = details;

    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (GetBenefits) -- error getting benefits data. - ${err}`
      );
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
      retVal.eventTitle = `${eventStrings.EventTitle} ${new Date().getFullYear()}`;
      retVal.headline = eventStrings.ScheduleHeading;
      retVal.imageCaption = `${eventStrings.ImageCaption} ${new Date().getFullYear()}`;
      retVal.introContent = eventStrings.IntroContent;
      retVal.mainImage = require('../images/event-schedule/Ignite-2021-fall-trim.gif');

    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (GetEvents) -- error getting Events data. - ${err}`
      );
    }
    return retVal;
  }

  public GetEventRegistrationLink(registration: EventRegistration): string {
    let retVal = "";
    try {
      //In a real world scenario you would use this method to save the 
      //save data into the system of record.
      //Here we are going to link to the Teams App and demonstrate deep linking
      retVal = encodeURI(`${this._teamsUrl}?context={"subEntityId":{"appName":"${AppList.EVENTSCHEDULE}","linkType":"${DeepLinkType.EVENTREGISTRATION}","message":${JSON.stringify(registration)}}}`);

    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (GetEventRegistrationLink) -- error getting event registration link. - ${err}`
      );
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
      console.error(
        `${this.LOG_SOURCE} (GetFAQs) -- error getting FAQ data. - ${err}`
      );
    }
    return retVal;
  }

  public SubmitFAQ(message: string): void {
    try {
      const url = encodeURI(`${this._teamsUrl}?context={"subEntityId":{"appName":"${AppList.FAQACCORDION}","linkType":"${DeepLinkType.TEXT}","message":"${message}"}}`);
      window.open(url);
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (SubmitFAQ) -- error submitting FAQ to Teams. - ${err}`
      );
    }
  }

  public GetImageCarousel(): ImageCarousel {
    let retVal: ImageCarousel = new ImageCarousel();
    try {
      //Sample pulls data from mock
      //To extend pull data from a list of your items
      retVal = require("../data/imagecarousel.data.json");
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (GetImageCarousel) -- error getting Image Carousel Data. - ${err}`
      );
    }
    return retVal;
  }

  public GetInventoryDetail(): InventoryDetail {
    let retVal: InventoryDetail = new InventoryDetail();
    try {
      //Sample pulls data from mock
      //To extend pull data from a list of your items
      retVal = require("../data/inventory.data.json");
      //We need to manipulate the data for the deep link to Teams.
      const inventoryItems: IInventoryItem[] = cloneDeep(retVal.inventoryItems);
      inventoryItems.map((item) => {
        const url = encodeURI(`${this._teamsUrl}?context={"subEntityId":{"appName":"${AppList.INVENTORY}","linkType":"${DeepLinkType.TEXT}","message":"${item.id}"}}`);
        item.linkUrl = url;
      });
      retVal.inventoryItems = inventoryItems;
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (GetInventoryDetail) -- error getting inventory data. - ${err}`
      );
    }
    return retVal;
  }

  public GetPayPeriods(): PayPeriod[] {
    const retVal: PayPeriod[] = [];
    try {
      const currentDate: Date = new Date();
      let payPeriodIndex = 0;
      for (let i = 0; i <= 11; i++) {
        let monthEnd: number;
        if (i == 3 || i == 5 || i == 8 || i == 10) {
          monthEnd = 30;
        } else if (i == 1) {
          if (currentDate.getFullYear() % 4 != 0 || (currentDate.getFullYear() % 100 == 0 && currentDate.getFullYear() % 400 != 0)) {
            monthEnd = 28;
          } else {
            monthEnd = 29;
          }
        } else {
          monthEnd = 31;
        }

        const monthStartDate: Date = new Date(currentDate.getFullYear(), i, 1);
        const payPeriod1End: Date = new Date(currentDate.getFullYear(), i, 15);
        const payPeriod2Start: Date = new Date(currentDate.getFullYear(), i, 16);
        const monthEndDate: Date = new Date(currentDate.getFullYear(), i, monthEnd);

        let payPeriod1Current = false;
        let payPeriod2Current = false;
        if (currentDate.getMonth() == i) {
          if (currentDate.getDate() <= payPeriod1End.getDate()) {
            payPeriod1Current = true;
          } else {
            payPeriod2Current = true;
          }
        }
        retVal.push(new PayPeriod(payPeriodIndex, monthStartDate.toISOString(), payPeriod1End.toISOString(), payPeriod1Current));
        payPeriodIndex = payPeriodIndex + 1;
        retVal.push(new PayPeriod(payPeriodIndex, payPeriod2Start.toISOString(), monthEndDate.toISOString(), payPeriod2Current));
        payPeriodIndex = payPeriodIndex + 1;
      }

    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (GetPayPeriods) -- error getting pay periods. - ${err}`
      );
    }
    return retVal;
  }

  public GetPaySlips(): Payslip[] {
    let retVal: Payslip[] = [];
    try {
      //Sample pulls data from mock
      //To extend pull data from a list of your items
      retVal = require("../data/payslip.data.json");
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (GetPaySlips) -- error getting payslip data. - ${err}`
      );
    }
    return retVal;
  }

  public GetSimpleList(local: string): SimpleList {
    let retVal: SimpleList = new SimpleList();
    try {
      //Sample pulls data from mock
      //To extend pull data from a list of your items
      retVal = require("../data/simplelist.data.json");
      const anniversaries: Anniversary[] = cloneDeep(retVal.anniversaries);
      const currentDate: Date = new Date();
      anniversaries.map((item) => {
        const anniversaryDate: Date = new Date(item.anniversaryDate);
        const duration = currentDate.getFullYear() - anniversaryDate.getFullYear();
        item.anniversaryLabel = Intl.DateTimeFormat(local, { weekday: undefined, year: undefined, month: 'short', day: 'numeric' }).format(anniversaryDate);
        item.anniversaryDuration = duration;
        const url = encodeURI(`${this._teamsUrl}?context={"subEntityId":{"appName":"${AppList.SIMPLELIST}","linkType":"${DeepLinkType.ANNIVERSARY}","message":"${item.id}"}}`);
        item.linkUrl = url;

      });
      retVal.anniversaries = anniversaries;

      const praise: Praise[] = cloneDeep(retVal.praise);
      praise.map((item) => {
        const url = encodeURI(`${this._teamsUrl}?context={"subEntityId":{"appName":"${AppList.SIMPLELIST}","linkType":"${DeepLinkType.PRAISE}","message":"${item.id}"}}`);
        item.linkUrl = url;
      });
      retVal.praise = praise;
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (GetSimpleList) -- error getting praise data. - ${err}`
      );
    }
    return retVal;
  }

  public getCalendarDays(currentDate: Date, local: string): Day[] {
    const retVal: Day[] = [];
    try {
      const currentMonthIndex: number = currentDate.getMonth();
      let dayCount = 31;
      if (currentMonthIndex == 3 || currentMonthIndex == 5 || currentMonthIndex == 8 || currentMonthIndex == 10) {
        dayCount = 30;
      } else if (currentMonthIndex == 1) {
        if (currentDate.getFullYear() % 4 != 0 || (currentDate.getFullYear() % 100 == 0 && currentDate.getFullYear() % 400 != 0)) {
          dayCount = 28;
        } else {
          dayCount = 29;
        }
      }

      for (let i = 1; i <= dayCount; i++) {
        const currentDay: Date = new Date(currentDate.getFullYear(), currentMonthIndex, i);
        const dayOfWeek: number = currentDay.getDay();
        if ((i == 1) && dayOfWeek != 0) {
          for (let x = dayOfWeek - 1; x >= 0; x--) {
            retVal.push(new Day());
          }
        }
        const day = new Day(currentMonthIndex, dayOfWeek, i, []);
        retVal.push(day);

        if ((i == dayCount) && dayOfWeek != 6) {
          for (let x = dayOfWeek + 1; x <= 6; x++) {
            retVal.push(new Day());
          }
        }
      }

      const appointments: Appointment[] = this.GetAppointments(currentDate, local);
      appointments.map((appt) => {
        const startDate: Date = new Date(appt.startDate);
        //If the event spans months set the start to the first day of the current month.
        if (currentDate.getMonth() != startDate.getMonth()) {
          startDate.setMonth(currentDate.getMonth());
          startDate.setDate(1);
        }
        const endDate: Date = new Date(appt.endDate);
        const dif: number = endDate.getTime() - startDate.getTime();
        const duration: number = dif / (1000 * 3600 * 24);
        for (let x = 0; x <= duration; x++) {
          const apptStartDate: Date = cloneDeep(startDate);
          apptStartDate.setDate(startDate.getDate() + x);
          const day: Day = find(retVal, { day: apptStartDate.getDate(), monthIndex: apptStartDate.getMonth() });
          if (day) {
            day.appointments.push(appt);
          }
        }

      });
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (getCalendarDays) -- error getting calendar day data. - ${err}`
      );
    }
    return retVal;
  }

  public GetAppointments(currentDate: Date, local: string): Appointment[] {
    const retVal: Appointment[] = [];
    try {
      //Sample pulls data from mock
      //To extend pull data from a list of your items
      const allAppointments: Appointment[] = require("../data/teamcalendar.data.json");
      allAppointments.map((appt) => {
        const today: Date = new Date();
        const apptStartDate: Date = new Date(appt.startDate);
        apptStartDate.setMonth(today.getMonth() + 1);
        const apptEndDate: Date = new Date(appt.endDate);
        apptEndDate.setMonth(today.getMonth() + 1);
        let dateString = "";
        if (apptStartDate.getMonth() == apptEndDate.getMonth() && apptStartDate.getDate() == apptEndDate.getDate()) {
          dateString = Intl.DateTimeFormat(local, { weekday: undefined, year: undefined, month: 'short', day: 'numeric' }).format(apptStartDate);
        } else if (apptStartDate.getDate() != apptEndDate.getDate() && apptStartDate.getMonth() == apptEndDate.getMonth()) {
          dateString = `${Intl.DateTimeFormat(local, { weekday: undefined, year: undefined, month: 'short', day: 'numeric' }).format(apptStartDate)}-${Intl.DateTimeFormat(local, { weekday: undefined, year: undefined, month: undefined, day: 'numeric' }).format(apptEndDate)}`;
        }
        else if (apptStartDate != apptEndDate && apptStartDate.getMonth() != apptEndDate.getMonth()) {
          dateString = `${Intl.DateTimeFormat(local, { weekday: undefined, year: undefined, month: 'short', day: 'numeric' }).format(apptStartDate)}-${Intl.DateTimeFormat(local, { weekday: undefined, year: undefined, month: 'short', day: 'numeric' }).format(apptEndDate)}`;
        }
        if (currentDate.getFullYear() == apptStartDate.getFullYear() && currentDate.getMonth() == apptStartDate.getMonth()) {
          retVal.push(new Appointment(apptStartDate.toISOString(), apptEndDate.toISOString(), dateString, appt.title, appt.appointmentType));
        } else if (currentDate.getFullYear() == apptEndDate.getFullYear() && currentDate.getMonth() == apptEndDate.getMonth()) {
          retVal.push(new Appointment(apptStartDate.toISOString(), apptEndDate.toISOString(), dateString, appt.title, appt.appointmentType));
        }
      });

    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (GetAppointments) -- error getting calendar data. - ${err}`
      );
    }
    return retVal;
  }

  public GetThisWeekData(currentDate: Date, local: string): Appointment[] {
    const retVal: Appointment[] = [];
    try {

      const sunday: Date = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay());
      const saturday: Date = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + (sunday.getDay() + 6));

      //Sample pulls data from mock
      //To extend pull data from a list of your items
      const allAppointments: Appointment[] = this.GetAppointments(currentDate, local);
      allAppointments.map((appt) => {
        const apptStartDate: Date = new Date(appt.startDate);
        const apptEndDate: Date = new Date(appt.endDate);
        //If Start date is after Sunday but before Saturday
        if (apptStartDate.getTime() > sunday.getTime() && apptStartDate.getTime() < saturday.getTime()) {
          retVal.push(appt);
        }
        //If end date is after Sunday but before Saturday
        else if (apptEndDate.getTime() >= sunday.getTime() && apptEndDate.getTime() <= saturday.getTime()) {
          retVal.push(appt);
        }
        //If start date is before sunday and end date is after saturday
        else if (apptStartDate.getTime() < sunday.getTime() && apptEndDate.getTime() > saturday.getTime()) {
          retVal.push(appt);
        }
      });

    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (GetThisWeekData) -- error getting calendar data for this week. - ${err}`
      );
    }
    return retVal;
  }

  public GetHolidayTimeline(local: string): HolidayTimeline {
    const retVal: HolidayTimeline = new HolidayTimeline();
    try {
      const today: Date = new Date();
      const holidays: Holiday[] = require("../data/timelineholiday.data.json");
      holidays.map((holiday) => {
        const holidayDate: Date = new Date(holiday.date);
        if (holidayDate.getTime() >= today.getTime()) {
          if ((holidayDate.getDay() == 1) && (holidayDate.getFullYear() == today.getFullYear())) {
            holiday.holidayWeekend = true;
            const friday: Date = new Date(holidayDate.getFullYear(), holidayDate.getMonth(), holidayDate.getDate() - 3);
            const tuesday: Date = new Date(holidayDate.getFullYear(), holidayDate.getMonth(), holidayDate.getDate() + 1);
            holiday.holidayWeekendFri = Intl.DateTimeFormat(local, { weekday: 'long', year: undefined, month: 'long', day: 'numeric' }).format(friday);
            holiday.holidayWeekendTue = Intl.DateTimeFormat(local, { weekday: 'long', year: undefined, month: 'long', day: 'numeric' }).format(tuesday);
          }
          holiday.dayLabel = Intl.DateTimeFormat(local, { weekday: undefined, year: undefined, month: 'long', day: 'numeric' }).format(holidayDate);
          holiday.year = holidayDate.getFullYear().toString();
          retVal.holidays.push(holiday);
          if (retVal.years.indexOf(holidayDate.getFullYear().toString()) <= -1) {
            retVal.years.push(holidayDate.getFullYear().toString());
          }
        }
      });
      if (retVal.holidays.length > 0) {
        retVal.nextHoliday = retVal.holidays[0];
      }
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (GetHolidayTimeline) -- error getting holiday data. - ${err}`
      );
    }
    return retVal;
  }

  public GetTimeOff(): TimeOff {
    let retVal: TimeOff = new TimeOff();
    try {
      //Sample pulls data from mock
      //To extend pull data from a list of your items
      retVal = require("../data/timeoff.data.json");
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (GetTimeOff) -- error getting time off data. - ${err}`
      );
    }
    return retVal;
  }

  public SubmitTimeOffRequest(request: TimeOffRequest): void {
    try {
      const url = encodeURI(`${this._teamsUrl}?context={"subEntityId":{"appName":"${AppList.TIMEOFF}","linkType":"${DeepLinkType.TIMEOFFREQUEST}","message":${JSON.stringify(request)}}}`);
      window.open(url);
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (SubmitTimeOffRequest) -- submitting time off request. - ${err}`
      );
    }
  }

  public SubmitVaccineAppointment(request: VaccineAppointment): void {
    try {
      const url = encodeURI(`${this._teamsUrl}?context={"subEntityId":{"appName":"${AppList.VACCINATIONBOOSTER}","linkType":"${DeepLinkType.VACCINATIONBOOSTER}","message":${JSON.stringify(request)}}}`);
      window.open(url);
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (SubmitVaccineAppointment) -- submitting vaccine registration to Teams. - ${err}`
      );
    }
  }

  public GetCafeterias(): Cafeteria[] {
    let retVal: Cafeteria[] = [];
    try {
      //Sample pulls data from mock
      //To extend pull data from a list of your items
      retVal = require("../data/visuallist.data.json");

      //We need to manipulate the data for the deep link to Teams.
      const cafes: Cafeteria[] = cloneDeep(retVal);
      cafes.map((cafe) => {
        const cuisine: Cuisine[] = cloneDeep(cafe.cuisine);
        cuisine.map((item) => {
          const url = encodeURI(`${this._teamsUrl}?context={"subEntityId":{"appName":"${AppList.VISUALLIST}","linkType":"${DeepLinkType.TEXT}","message":"${item.id}"}}`);
          item.linkUrl = url;
        });
        cafe.cuisine = cuisine;
      });
      retVal = cafes;
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (GetCafeterias) -- getting cafe data. - ${err}`
      );
    }
    return retVal;
  }

  public GetHelpDeskTicketLink(ticket: HelpDeskTicket): string {
    let retVal = "";
    try {
      //In a real world scenario you would use this method to save the 
      //save data into the system of record.
      //Here we are going to link to the Teams App and demonstrate deep linking
      retVal = encodeURI(`${this._teamsUrl}?context={"subEntityId":{"appName":"${AppList.HELPDESKCREATE}","linkType":"${DeepLinkType.HELPDESKTICKET}","message":${JSON.stringify(ticket)}}}`);

    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (GetHelpDeskTicketLink) -- getting HelpDesk link to Teams. - ${err}`
      );
    }
    return retVal;
  }

  public GetHelpDeskTickets(bingMapsKey: string): HelpDeskTicket[] {
    let retVal: HelpDeskTicket[] = [];
    try {
      //Sample pulls data from mock
      //To extend pull data from a list of your items
      const tickets: HelpDeskTicket[] = require("../data/helpdesk.data.json");

      //We are manipulating the data here to set the due dates so there is always relevant data in the sample.
      //You can remove this code if you are attaching it to a ticketing system
      tickets.map(async (ticket, index) => {
        const newTicket = ticket;
        const eventDate: Date = new Date();
        let offset = 0;
        if (index === 0) {
          offset = 8;
        } else {
          offset = index;
        }
        eventDate.setDate(eventDate.getDate() - offset);
        const monthNumber: number = eventDate.getMonth() + 1;
        let month: string = monthNumber.toString();
        let datestring: string = eventDate.getDate().toString();
        if (monthNumber < 10) {
          month = `0${month}`;
        }
        if (eventDate.getDate() < 10) {
          datestring = `0${datestring}`;
        }
        newTicket.createDate = `${eventDate.getFullYear().toString()}-${month}-${datestring}T00:00:00Z`;

        //Check if it is overdue
        const today: Date = new Date();
        const dueDate: Date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        if (eventDate.getTime() < dueDate.getTime()) {
          newTicket.overdue = true;
          const msInDay = 24 * 60 * 60 * 1000;
          const difference = Math.round(Math.abs(Number(dueDate.getTime()) - Number(today.getTime())) / msInDay);
          newTicket.overdueTime = difference.toString();
        } else {
          newTicket.overdue = false;
          newTicket.overdueTime = "";
        }
        //Set the location based on the lat and long in the sample data
        if (bingMapsKey) {
          const location = await this.GetLocationData(ticket.latitude, ticket.longitude, bingMapsKey);
          if (location != "") {
            newTicket.location = location;
          }
        }
        ticket = newTicket;
      });
      retVal = tickets;

    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (GetHelpDeskTickets) -- getting Help Desk Ticket Data. - ${err}`
      );
    }
    return retVal;
  }

  public CloseHelpDeskTickets(tickets: HelpDeskTicket[], currentTicket: HelpDeskTicket): HelpDeskTicket[] {
    let retVal: HelpDeskTicket[] = [];
    try {

      retVal = tickets.filter(ticket => ticket.incidentNumber != currentTicket.incidentNumber);

    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (CloseHelpDeskTickets) -- closing Help Desk Ticket. - ${err}`
      );
    }
    return retVal;
  }

  public async createList(
    listName: string,
    listDescription: string,
    fieldList: IFieldList[]
  ): Promise<boolean> {
    let retVal = false;
    try {
      const list: IListAddResult = await this._sp.web.lists.add(
        listName,
        `${listName} ${listDescription} List`,
        109,
        false,
        { OnQuickLaunch: true }
      );
      for (let i = 0; i < fieldList.length; i++) {
        if (fieldList[i].props.FieldTypeKind === 2) {
          await this._sp.web.lists
            .getById(list.data.Id)
            .fields.addText(fieldList[i].name);
        } else if (fieldList[i].props.FieldTypeKind === 3) {
          await this._sp.web.lists
            .getById(list.data.Id)
            .fields.createFieldAsXml(
              `<Field Type="Note" Name="${fieldList[i].name}" DisplayName="${fieldList[i].name}" Required="FALSE" RichText="TRUE" RichTextMode="FullHtml" />`
            );
        } else if (fieldList[i].props.FieldTypeKind === 4) {
          await this._sp.web.lists
            .getById(list.data.Id)
            .fields.addDateTime(fieldList[i].name, {
              DisplayFormat: DateTimeFieldFormatType.DateTime,
              DateTimeCalendarType: CalendarType.Gregorian,
              FriendlyDisplayFormat: DateTimeFieldFriendlyFormatType.Disabled,
            });
        } else if (fieldList[i].props.FieldTypeKind === 6) {
          await this._sp.web.lists
            .getById(list.data.Id)
            .fields.addChoice(fieldList[i].name, {
              Choices: fieldList[i].props.choices,
            });
        } else if (fieldList[i].props.FieldTypeKind === 11) {
          await this._sp.web.lists
            .getById(list.data.Id)
            .fields.addUrl(fieldList[i].name, {
              DisplayFormat: UrlFieldFormatType.Hyperlink,
            });
        } else if (fieldList[i].props.FieldTypeKind === 12) {
          await this._sp.web.lists
            .getById(list.data.Id)
            .fields.addNumber(fieldList[i].name);
        }
      }
      const view: IView = await this._sp.web.lists.getById(list.data.Id)
        .defaultView;
      for (let i = 0; i < fieldList.length; i++) {
        await view.fields.add(fieldList[i].name);
      }
      retVal = true;
    } catch (err) {
      console.error(`${this.LOG_SOURCE}:(createList) - ${err}`);
    }
    return retVal;
  }

  public async GetLocationData(latitude: string, longitude: string, apiKey: string): Promise<string> {
    let retVal = "";
    try {
      const url = `https://dev.virtualearth.net/REST/v1/Locations/${latitude},${longitude}?includeEntityTypes=Address,Neighborhood,PopulatedPlace&key=${apiKey}`;
      const results: any = await fetch(url).then(res => res.json());

      retVal = results.resourceSets[0].resources[0].address.addressLine;
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (GetLocationData) -- error generating link to BingMaps. - ${err}`
      );
    }
    return retVal;
  }

  public GetCurrentLocation(): Promise<any> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  public async CheckList(listName: string): Promise<boolean> {
    let retVal = false;
    try {
      const lists: ILists = this._sp.web.lists;
      const list = await lists.filter(`Title eq '${listName}'`)();

      if (list.length > 0) {
        retVal = true;
      }
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (checkList) - ${err}`
      );
    }
    return retVal;
  }
  public async CanUserUpload(listName: string): Promise<boolean> {
    let retVal = false;
    try {
      const list = await this._sp.web.lists.getByTitle(listName);
      retVal = await list.currentUserHasPermissions(PermissionKind.AddListItems);
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (checkList) - ${err}`
      );
    }
    return retVal;
  }

  public async AddImage(listName: string, fileName: string, fileContents: Uint8Array): Promise<boolean> {
    let retVal = false;
    try {
      const fileNamePath = encodeURI(fileName);

      let result: IFileAddResult;
      // you can adjust this number to control what size files are uploaded in chunks
      if (fileContents.length <= 10485760) {
        // small upload
        result = await this._sp.web.lists.getByTitle(listName).rootFolder.files.addUsingPath(fileNamePath, fileContents, { Overwrite: true });
        if (result) {
          retVal = true;
        }
      } else {
        // large upload
        //Convert the byteArray to a blob
        const blob = new Blob([fileContents.buffer]);
        result = await this._sp.web.lists.getByTitle(listName).rootFolder.files.addChunked(fileNamePath, blob, data => {
          console.log(`image progress ${data.totalBlocks}`);
        }, true);
      }
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (checkList) - ${err}`
      );
    }
    return retVal;
  }
}
export const dtg = new DesignTemplateGalleryService();