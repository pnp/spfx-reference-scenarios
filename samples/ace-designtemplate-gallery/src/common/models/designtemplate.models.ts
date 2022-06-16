import { random } from "@microsoft/sp-lodash-subset";

export enum AppList {
  BENEFITS = "Benefits",
  EVENTSCHEDULE = "Event Schedule",
  FAQACCORDION = "FAQ Accordion",
  HELPDESK = "Help Desk",
  HELPDESKCREATE = "Help Desk Create Ticket",
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
  EVENTREGISTRATION,
  INVENTORYITEM,
  ANNIVERSARY,
  PRAISE,
  TIMEOFFREQUEST,
  VACCINATIONBOOSTER,
  HELPDESKTICKET
}

export enum CardImageType {
  CARDVIEW,
  QUICKVIEW
}

export enum AppointmentType {
  OOO,
  TASK
}

export enum TimeOffRequestType {
  SICKTIME,
  PTO,
  WELLNESS
}

export interface IIconType {
  Class: string;
  SVG: string;
}

export interface IAppData {
  appName: string;
  appDescription: string;
  appCardImage: string;
  appQuickViewImage: string;
  appDesignerLink: string;
  appGitHubLink: string;
}

export class AppData implements IAppData {
  constructor(
    public appName: string = "",
    public appDescription: string = "",
    public appCardImage: string = "",
    public appQuickViewImage: string = "",
    public appDesignerLink: string = "",
    public appGitHubLink: string = ""
  ) { }
}

export interface IDeepLinkData {
  appName: string;
  deepLinkType?: DeepLinkType;
  message?: string | EventRegistration | InventoryItem;
}

export class DeepLinkData implements IDeepLinkData {
  constructor(
    public appName: string = "",
    public deepLinkType: DeepLinkType = DeepLinkType.TEXT,
    public message = null
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
  id: string;
  title: string;
  description: string;
  isTeamsDeepLink: boolean;
  linkText: string;
  linkUrl: string;
  image: string;
}

export class BenefitDetails implements IBenefitsDetails {
  constructor(
    public id: string,
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

export interface IInventoryDetail {
  amountAvailable: number;
  amountAvailableChange: number;
  readyToShipAvailable: number;
  readyToShipChange: number;
  inventoryItems: IInventoryItem[];
}

export class InventoryDetail implements IInventoryDetail {
  constructor(
    public amountAvailable: number = 0,
    public amountAvailableChange: number = 0,
    public readyToShipAvailable: number = 0,
    public readyToShipChange: number = 0,
    public inventoryItems: IInventoryItem[] = []
  ) { }
}
export interface IInventoryItem {
  id: string;
  imageUrl: string;
  name: string;
  amount: string;
  change: string;
  linkUrl?: string;
}

export class InventoryItem implements IInventoryItem {
  constructor(
    public id: string = "",
    public imageUrl: string = "",
    public name: string = "",
    public amount: string = "",
    public change: string = "",
    public linkUrl: string = ""
  ) { }
}

export interface IPayPeriod {
  id: number;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export class PayPeriod implements IPayPeriod {
  constructor(
    public id: number = 0,
    public startDate: string = "",
    public endDate: string = "",
    public isCurrent: boolean = false
  ) { }
}

export interface IPayslip {
  payPeriod: number;
  netPay: number;
  earnings: number;
  bonus: number;
  commission: number;
  regularPay: number;
  deductions: number;
  childSupport: number;
  dental: number;
  depCare: number;
  health: number;
  HMOMedical: number;
  prescriptionDrugs: number;
  unitedWay: number;
  taxes: number;
  medicare: number;
  fedTax: number;
  ssi: number;
}

export class Payslip implements IPayslip {
  constructor(
    public payPeriod: number = 0,
    public netPay: number = 0,
    public earnings: number = 0,
    public bonus: number = 0,
    public commission: number = 0,
    public regularPay: number = 0,
    public deductions: number = 0,
    public childSupport: number = 0,
    public dental: number = 0,
    public depCare: number = 0,
    public health: number = 0,
    public HMOMedical: number = 0,
    public prescriptionDrugs: number = 0,
    public unitedWay: number = 0,
    public taxes: number = 0,
    public medicare: number = 0,
    public fedTax: number = 0,
    public ssi: number = 0,
  ) { }
}

export interface ISimpleList {
  anniversaries: Anniversary[];
  praise: Praise[];
}

export class SimpleList implements ISimpleList {
  constructor(
    public anniversaries: Anniversary[] = [],
    public praise: Praise[] = []
  ) { }
}
export interface IAnniversary {
  id: string | number;
  imageUrl: string;
  firstName: string;
  lastName: string;
  role: string;
  anniversaryDate: string;
  anniversaryLabel?: string;
  anniversaryDuration?: number;
  linkUrl: string;
}

export class Anniversary implements IAnniversary {
  constructor(
    public id: string = "0",
    public imageUrl: string = "",
    public firstName: string = "",
    public lastName: string = "",
    public role: string = "",
    public anniversaryDate: string = "",
    public anniversaryLabel: string = "",
    public anniversaryDuration: number = 0,
    public linkUrl: string = ""
  ) { }
}
export interface IPraise {
  id: string | number;
  imageUrl: string;
  title: string;
  comment: string;
  linkUrl: string;
}

export class Praise implements IPraise {
  constructor(
    public id: string = "0",
    public imageUrl: string = "",
    public title: string = "",
    public comment: string = "",
    public linkUrl: string = ""
  ) { }
}

export interface IDay {
  monthIndex: number;
  weekDayIndex: number;
  day: number;
  appointments: Appointment[];

}

export class Day implements IDay {
  constructor(
    public monthIndex: number = 0,
    public weekDayIndex: number = 0,
    public day: number = 0,
    public appointments: Appointment[] = []
  ) { }
}

export interface IAppointment {
  startDate: string;
  endDate: string;
  dateString?: string;
  title: string;
  appointmentType: AppointmentType;

}

export class Appointment implements IAppointment {
  constructor(
    public startDate: string = "",
    public endDate: string = "",
    public dateString: string = "",
    public title: string = "",
    public appointmentType: AppointmentType.OOO
  ) { }
}

export interface IHolidayTimeline {
  holidays: Holiday[];
  nextHoliday: Holiday;
  years: string[];
}

export class HolidayTimeline implements IHolidayTimeline {
  constructor(
    public holidays: Holiday[] = [],
    public nextHoliday: Holiday = new Holiday(),
    public years: string[] = []
  ) { }
}

export interface IHoliday {
  date: string;
  dayLabel?: string;
  year?: string;
  title: string;
  text: string;
  imageUrl: string;
  holidayWeekend: boolean;
  holidayWeekendFri: string;
  holidayWeekendTue: string;

}

export class Holiday implements IHoliday {
  constructor(
    public date: string = "",
    public dayLabel: string = "",
    public year: string = "",
    public title: string = "",
    public text: string = "",
    public imageUrl: string = "",
    public holidayWeekend: boolean = false,
    public holidayWeekendFri: string = "",
    public holidayWeekendTue: string = "",
  ) { }
}

export interface ITimeOff {
  sickDays: number;
  pto: number;
  wellness: number;
}

export class TimeOff implements ITimeOff {
  constructor(
    public sickDays: number = 0,
    public pto: number = 0,
    public wellness: number = 0
  ) { }
}

export interface ITimeOffRequest {
  requestType: TimeOffRequestType;
  allDay: boolean;
  date: Date;
}

export class TimeOffRequest implements ITimeOffRequest {
  constructor(
    public requestType: TimeOffRequestType.PTO,
    public allDay: boolean = true,
    public date: Date = new Date()
  ) { }
}

export interface IVaccineAppointment {
  lastDoseDate: Date;
  prevVaccineBrand: string;
  apptDate: Date;
  boosterVaccineBrand: string;
}

export class VaccineAppointment implements IVaccineAppointment {
  constructor(
    public lastDoseDate: Date = new Date(),
    public prevVaccineBrand: string = "",
    public apptDate: Date = new Date(),
    public boosterVaccineBrand: string = "",
  ) { }
}

export interface ICafeteria {
  id: string;
  name: string;
  description: string;
  cuisine: Cuisine[];
}

export class Cafeteria implements ICafeteria {
  constructor(
    public id: string = "",
    public name: string = "",
    public description: string = "",
    public cuisine: Cuisine[] = []

  ) { }
}

export interface ICuisine {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
}

export class Cuisine implements ICuisine {
  constructor(
    public id: string = "",
    public name: string = "",
    public description: string = "",
    public imageUrl: string = "",
    public linkUrl: string = "",
  ) { }
}

export interface IHelpDeskTicket {
  incidentNumber: string;
  requestedBy: DemoUser;
  createDate: string;
  category: string;
  urgency: string;
  state: string;
  description: string;
  location: string;
  requestType?: string;
  overdue?: boolean;
  overdueTime?: string;
}

export class HelpDeskTicket implements IHelpDeskTicket {
  constructor(
    public incidentNumber: string = "",
    public requestedBy: DemoUser = new DemoUser(),
    public createDate: string = "",
    public category: string = "",
    public urgency: string = "",
    public state: string = "New",
    public description: string = "",
    public location: string = "",
    public requestType: string = "",
    public overdue: boolean = false,
    public overdueTime: string = "",
  ) { }
}

export interface IDemoUser {
  id: string;
  displayName: string;
  imageUrl: string;
}

export class DemoUser implements IDemoUser {
  constructor(
    public id: string = "",
    public displayName: string = "",
    public imageUrl: string = ""
  ) { }
}
