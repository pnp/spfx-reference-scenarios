import { AadHttpClient } from '@microsoft/sp-http';

export interface IOboConsumerProps {
  middlewareUrl: string;
  middlewareClient: AadHttpClient;
  hasTeamsContext: boolean;
  isDarkTheme: boolean;
  onConfigure: () => void;
}
