declare interface IMeetingVotingWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  TitleLabel: string;
  ParticipantsTitleLabel: string;
  VotesTitleLabel: string;
  ExceptionTitle: string;
  MissingClientsExceptionMessage: string;
  FailedConsumingAPIExceptionMessage: string;
  ExceptionRetryButtonLabel: string;
  CommandNewLabel: string;
  CommandEditLabel: string;
  CommandDeleteLabel: string;
  CommandLaunchLabel: string;
  CommandCloseLabel: string;
}

declare module 'MeetingVotingWebPartStrings' {
  const strings: IMeetingVotingWebPartStrings;
  export = strings;
}
