import { SPHttpClient } from '@microsoft/sp-http';

export interface IWellbeingRequestReviewProps {
  isDarkTheme: boolean;
  hasTeamsContext: boolean;
  requestId: string;
  spHttpClient: SPHttpClient;
  webUrl: string;
  wellbeingRequestsListName: string;
  wellbeingGroupMailAddress: string;
  isNarrow: boolean;
  fileListQuery: string;
  error: boolean;
  errorMessage: string;
}
