declare interface ICovidWebPartStrings {
  ConfigurationNeeded: string;
  ConfigureNow: string;
  CovidFormSelfCheckInTitle: string;
  CovidFormIntro: string;
  CovidFormGuestLabel: string;
  CovidFormOfficeLabel: string;
  CovidFormGuestValue: string;
  AdminCheckInTitle: string;
  AdminCheckInIntro: string;
  CheckInHeader: string;
  CheckInConfirmation: string;
  CheckInSuccessHeader: string;
  CheckInSuccessContent: string;
  TodayHeader: string;
  TodaySubHeader: string;
  AdministrationHeader: string;
  AdministrationSubHeader: string;
  ManageLocations: string;
  ManageQuestions: string;
  ContractTracingHeader: string;
  ContractTracingSubHeader: string;
  SearchStartDateLabel: string;
  SearchEndDateLabel: string;
  SearchOfficeLabel: string;
  SearchPersonLabel: string;
  SearchButtonLabel: string;
  AdminTabToday: string;
  AdminTabRegisterGuest: string;
  AdminTabSelfCheckIn: string;
  AdminTabContactTracing: string;
  AdminTabAdministration: string;
  SaveLabel: string;
  CancelLabel: string;
}

declare module 'CovidWebPartStrings' {
  const strings: ICovidWebPartStrings;
  export = strings;
}
