import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'ManageTopicWebPartStrings';
import ManageTopic from './components/ManageTopic';
import { IManageTopicWebPartProps } from './IManageTopicWebPartProps';
import { IManageTopicProps } from './components/IManageTopicProps';

import { AadHttpClient } from '@microsoft/sp-http';

import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';

export default class ManageTopicWebPart extends BaseClientSideWebPart<IManageTopicWebPartProps> {

  private initialValue: string;

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

       // Get the client to consume the back-end API
       this.aadHttpClient = await this.context.aadHttpClientFactory
         .getClient(this.properties.apiAudience);
 
       if (this.context.sdks.microsoftTeams) {
         // checking that we're in Teams
         const context = this.context.sdks.microsoftTeams!.context;
         this._applyTheme(context.theme || 'default');
         this.context.sdks.microsoftTeams.teamsJs.registerOnThemeChangeHandler(this._applyTheme);
       }

       const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
       this.initialValue = urlParams.get('initialValue');
 
       initializeIcons();
     });
   }
 
   private _applyTheme = (theme: string): void => {
     this.theme = theme;
     this.context.domElement.setAttribute('data-theme', theme);
     document.body.setAttribute('data-theme', theme);
   }

   public render(): void {
    const element: React.ReactElement<IManageTopicProps> = React.createElement(
      ManageTopic,
      {
        theme: this.theme,
        apiUrl: this.properties.apiUrl,
        aadHttpClient: this.aadHttpClient,
        teamsContext: this.context.sdks.microsoftTeams,
        initialValue: this.initialValue
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
