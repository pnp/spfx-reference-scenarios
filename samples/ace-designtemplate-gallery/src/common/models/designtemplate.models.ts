import { Guid } from "@microsoft/sp-core-library";

export enum AppList {
  BENEFITS = "Benefits",
  EVENTSCHEDULE = "Event Schedule",
  FAQACCORDION = "FAQ Accordion",
  IMAGECAROUSEL = "Image Carousel",
  INVENTORY = "Inventory",
  PAYSLIP = "Payslip",
  SIMPLELIST = "Simple List",
  TEAMCALENDAR = "Team Calendar",
  TIMELINEHOLIDAY = "Timeline/Holiday",
  TIMEOFF = "Timeoff",
  VACCINATIONBOOSTER = "Vaccination Booster",
  VISUALLIST = "Visual List"
}

export interface IIconType {
  Class: string;
  SVG: string;
}

export interface IApp {
  appData: AppData;
  cardData: any;
}
export class App implements IApp {
  constructor(
    public appData: AppData = new AppData(),
    public cardData: any = {}
  ) { }
}

export interface IAppData {
  appName: string;
  appDescription: string;
  appCardImage: string;
  appQuickViewImage: string;
  linkTitle: string;
}

export class AppData implements IAppData {
  constructor(
    public appName: string = "",
    public appDescription: string = "",
    public appCardImage: string = "",
    public appQuickViewImage: string = "",
    public linkTitle: string = ""
  ) { }
}

export interface IBenefits {
  title: string;
  mainImage: string;
  headline: string;
  introContent: string;
  details: IBenefitsDetails[];
}

export class Benefits implements IBenefits {
  constructor(
    public appName: string = "",
    public appImage: string = "",
    public title: string = "",
    public mainImage: string = "",
    public headline: string = "",
    public introContent: string = "",
    public details: IBenefitsDetails[] = []
  ) { }
}

export interface IBenefitsDetails {
  guid: string;
  title: string;
  description: string;
  isTeamsDeepLink: boolean;
  linkText: string;
  linkUrl: string;
  image: string;
}

export class BenefitDetails implements IBenefitsDetails {
  constructor(
    public guid: string = Guid.newGuid().toString(),
    public title: string = "",
    public description: string = "",
    public isTeamsDeepLink: boolean = false,
    public linkText: string = "",
    public linkUrl: string = "",
    public image: string = ""
  ) { }
}

export interface ILinkData {
  appName: string;
  linkGUID: string;
}

export class LinkData implements ILinkData {
  constructor(
    public appName: string = "",
    public linkGUID: string = ""
  ) { }
}

