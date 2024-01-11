declare interface IExpenseReportAdaptiveCardExtensionStrings {
  PropertyPaneDescription: string;
  TitleFieldLabel: string;
  Title: string;
  ServiceBaseUrlFieldLabel: string;
  ApiUrlFieldLabel: string;
  ApiUrl: string;
  PrimaryText: string;
  ConfirmationText: string;
  Description: string;
  NewExpense: string;
  GoHome: string;
  ExpenseReport: {
    DescriptionLabel: string;
    DescriptionRequiredMessage: string;
    DescriptionPlaceholder: string;
    CategoryLabel: string;
    CategoryPlaceholder: string;
    DateLabel: string;
    DatePlaceholder: string;
    DateRequiredMessage: string;
    UploadButtonLabel: string;
    SubmitExpenseButtonLabel: string;
  }
}

declare module 'ExpenseReportAdaptiveCardExtensionStrings' {
  const strings: IExpenseReportAdaptiveCardExtensionStrings;
  export = strings;
}
