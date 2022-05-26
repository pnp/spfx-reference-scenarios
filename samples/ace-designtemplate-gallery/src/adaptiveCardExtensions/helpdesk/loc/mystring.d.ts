declare interface IHelpdeskAdaptiveCardExtensionStrings {
  PropertyPaneDescription: string;
  GroupName: string;
  TitleFieldLabel: string;
  IconPropertyFieldLabel: string;
  QuickViewButtonText: striing;
  CardViewTextSingular: string;
  CardViewTextPlural: string;
  CardViewNoTasks: string;
  CardViewDescription: string;
  QuickViewDescription: string;
  OpenedLabel: string;
  OverdueLabel: string;
}

declare module 'HelpdeskAdaptiveCardExtensionStrings' {
  const strings: IHelpdeskAdaptiveCardExtensionStrings;
  export = strings;
}
