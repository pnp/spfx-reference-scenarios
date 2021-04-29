import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'MeetingVotingWebPartStrings';
import MeetingVoting from './components/MeetingVoting';
import { IMeetingVotingProps } from './components/IMeetingVotingProps';

import { IMeetingVotingWebPartProps } from './IMeetingVotingWebPartProps';
import { MSGraphClient, AadHttpClient } from "@microsoft/sp-http";
import { Providers, SharePointProvider } from '@microsoft/mgt';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';

const packageSolution: any = require("../../../config/package-solution.json");

export default class MeetingVotingWebPart extends BaseClientSideWebPart<IMeetingVotingWebPartProps> {

  /***************************************************************************
  * Support for consuming the Microsoft Graph API
  ***************************************************************************/
  private graphClient: MSGraphClient;

  /***************************************************************************
  * Support for consuming the back-end API
  ***************************************************************************/
  private aadHttpClient: AadHttpClient;

  /***************************************************************************
  * Support for Microsoft Teams themeing
  ***************************************************************************/
  private theme: string; 
  
  public async onInit(): Promise<void> {
    return super.onInit().then(async _ => {

      // Initialize the MGT provider for SharePoint
      Providers.globalProvider = new SharePointProvider(this.context);
      
      // Get the client to consume the Microsoft Graph API
      this.graphClient = await this.context.msGraphClientFactory
        .getClient();

      // Get the client to consume the back-end API
      this.aadHttpClient = await this.context.aadHttpClientFactory
        .getClient(this.properties.apiAudience);

      if (this.context.sdks.microsoftTeams) {
        // checking that we're in Teams
        const context = this.context.sdks.microsoftTeams!.context;
        this._applyTheme(context.theme || 'default');
        this.context.sdks.microsoftTeams.teamsJs.registerOnThemeChangeHandler(this._applyTheme);
      }

      

      initializeIcons();
    });
  }

  private _applyTheme = (theme: string): void => {
    this.theme = theme;
    this.context.domElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }

  public render(): void {

    const tenant: string = this.context.pageContext.site.absoluteUrl.substring(8);
    

    const element: React.ReactElement<IMeetingVotingProps> = React.createElement(
      MeetingVoting,
      {
        theme: this.theme,
        apiUrl: this.properties.apiUrl,
        spoTenantName: tenant,
        graphClient: this.graphClient,
        aadHttpClient: this.aadHttpClient,
        teamsContext: this.context.sdks.microsoftTeams,
        currentUser: this.context.pageContext.user.loginName,
        buildVersion: packageSolution.solution.version
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }
}
