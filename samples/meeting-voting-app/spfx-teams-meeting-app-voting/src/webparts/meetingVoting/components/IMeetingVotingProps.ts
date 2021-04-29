import { IMicrosoftTeams } from "@microsoft/sp-webpart-base";
import { MSGraphClient, AadHttpClient } from "@microsoft/sp-http";

export interface IMeetingVotingProps {
  theme: string;
  apiUrl: string;
  spoTenantName: string;
  graphClient: MSGraphClient;
  aadHttpClient: AadHttpClient;
  teamsContext: IMicrosoftTeams;
  currentUser: string;
  buildVersion: string;
}
