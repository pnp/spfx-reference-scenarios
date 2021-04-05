declare interface ICovidWebPartStrings {
  CovidFormSelfCheckInTitle: string;
  CovidFormIntro: string;
  CovidFormGuestCheckInTitle: string;
  AdminCheckInTitle: string;
  AdminCheckInIntro: string
}

declare module 'CovidWebPartStrings' {
  const strings: ICovidWebPartStrings;
  export = strings;
}
