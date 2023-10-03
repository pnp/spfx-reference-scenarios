import { AadHttpClient } from '@microsoft/sp-http';

export interface IConsumeMiddlewareProps {
  middlewareUrl: string;
  middlewareClient: AadHttpClient;
  tenantName: string;
  siteRelativeUrl: string;
  spoAccessToken: string;
  graphAccessToken: string;
  isDarkTheme: boolean;
  hasTeamsContext: boolean;
  onConfigure: () => void;
}
