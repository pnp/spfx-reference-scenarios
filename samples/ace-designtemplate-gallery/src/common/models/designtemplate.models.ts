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

export enum DeepLinkType {
  TEXT,
  EVENTREGISTRATION
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
  deepLinkData?: DeepLinkData;
}

export class AppData implements IAppData {
  constructor(
    public appName: string = "",
    public appDescription: string = "",
    public appCardImage: string = "",
    public appQuickViewImage: string = "",
    public deepLinkData?: DeepLinkData
  ) { }
}

export interface IDeepLinkData {
  deepLinkType: DeepLinkType;
  linkText?: string;
  eventRegistration?: EventRegistration;
}

export class DeepLinkData implements IDeepLinkData {
  constructor(
    public deepLinkType,
    public linkText: string = "",
    public eventRegistration?: EventRegistration
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

export interface IEvent {
  cardViewImage: string;
  eventTitle: string;
  mainImage: string;
  imageCaption: string;
  headline: string;
  introContent: string;
  days: IEventDay[];
}

export class Event implements IEvent {
  constructor(
    public cardViewImage: string = "",
    public eventTitle: string = "",
    public mainImage: string = "",
    public imageCaption: string = "",
    public headline: string = "",
    public introContent: string = "",
    public days: IEventDay[] = []
  ) { }
}

export interface IEventDay {
  id: string | number;
  date: string;
  scheduleItems: IScheduleItem[];
}

export class EventDay implements IEventDay {
  constructor(
    public id: number = 1,
    public date: string = "",
    public scheduleItems: IScheduleItem[] = []
  ) { }
}

export interface IScheduleItem {
  startTime: string;
  endTime: string;
  description: string;
}

export class ScheduleItem implements IScheduleItem {
  constructor(
    public startTime: string = "",
    public endTime: string = "",
    public description: string = ""
  ) { }
}
export interface IEventRegistration {
  eventTitle: string;
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  privacy: string;
}

export class EventRegistration implements IEventRegistration {
  constructor(
    public eventTitle: string = "",
    public firstName: string = "",
    public lastName: string = "",
    public company: string = "",
    public phone: string = "",
    public privacy: string = ""
  ) { }
}

export interface IAccordionList {
  title: string;
  mainImage: string;
  imageCaption: string;
  introContent: string;
  faqs: IFAQ[];
}

export class AccordionList implements IAccordionList {
  constructor(
    public title: string = "",
    public imageCaption: string = "",
    public mainImage: string = "",
    public introContent: string = "",
    public faqs: IFAQ[] = []
  ) { }
}

export interface IFAQ {
  id: number;
  question: string;
  answer: string;
  icons?: IIcon[];
}

export class FAQ implements IFAQ {
  constructor(
    public id: 0,
    public question: string = "",
    public answer: string = "",
    public icons: IIcon[] = []
  ) { }
}

export interface IIcon {
  title: string;
  iconUrl: string;
  iconText?: string;
  iconLink?: string;
  linkTitle?: string;
}

export class Icon implements IIcon {
  constructor(
    public title: string = "",
    public iconUrl: string = "",
    public iconText: string = "",
    public iconLink: string = "",
    public linkTitle: string = ""
  ) { }
}

export interface IImageCarousel {
  title: string;
  introContent: string;
  icons: IIcon[];
  specTypes: ISpecType[];
  images: IProductImage[];
}

export class ImageCarousel implements IImageCarousel {
  constructor(
    public title: string = "",
    public introContent: string = "",
    public icons: IIcon[] = [],
    public specTypes: ISpecType[] = [],
    public images: IProductImage[] = []
  ) { }
}
export interface ISpecType {
  title: string;
  specs: ISpec[];
}

export class SpecType implements ISpecType {
  constructor(
    public title: string = "",
    public specs: ISpec[] = []
  ) { }
}
export interface ISpec {
  title: string;
  text: string;
}

export class Spec implements ISpec {
  constructor(
    public title: string = "",
    public text: string = ""
  ) { }
}

export interface IProductImage {
  imageUrl: string;
}

export class ProductImage implements IProductImage {
  constructor(
    public imageUrl: string = ""
  ) { }
}