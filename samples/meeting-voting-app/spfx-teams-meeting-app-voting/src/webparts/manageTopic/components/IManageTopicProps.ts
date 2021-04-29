import { IMicrosoftTeams } from "@microsoft/sp-webpart-base";
import { AadHttpClient } from "@microsoft/sp-http";

export interface IManageTopicProps {
  theme: string;
  apiUrl: string;
  aadHttpClient: AadHttpClient;
  teamsContext: IMicrosoftTeams;
  initialValue: string;
}