declare interface ICovidWebPartStrings {
  ConfigurationNeeded: string;
  ConfigureNow: string;
  CovidFormSelfCheckInTitle: string;
  CovidFormIntro: string;
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
}

declare module 'CovidWebPartStrings' {
  const strings: ICovidWebPartStrings;
  export = strings;
}
