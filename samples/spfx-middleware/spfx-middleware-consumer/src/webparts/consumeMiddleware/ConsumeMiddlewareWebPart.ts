import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'ConsumeMiddlewareWebPartStrings';
import ConsumeMiddleware from './components/ConsumeMiddleware';
import { IConsumeMiddlewareProps } from './components/IConsumeMiddlewareProps';

import { AadHttpClient, AadTokenProvider } from '@microsoft/sp-http';

export interface IConsumeMiddlewareWebPartProps {
  middlewareUrl: string;
}

export default class ConsumeMiddlewareWebPart extends BaseClientSideWebPart<IConsumeMiddlewareWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _middlewareClient: AadHttpClient;
  private _spoAccessToken: string = "";
  private _graphAccessToken: string = "";

  public render(): void {
    const element: React.ReactElement<IConsumeMiddlewareProps> = React.createElement(
      ConsumeMiddleware,
      {
        middlewareUrl: this.properties.middlewareUrl,
        middlewareClient: this._middlewareClient,
        tenantName: this.context.pageContext.site.absoluteUrl.substring(8, this.context.pageContext.site.absoluteUrl.indexOf('sharepoint.com/') + 14),
        siteRelativeUrl: this.context.pageContext.site.serverRelativeUrl,
        spoAccessToken: this._spoAccessToken,
        graphAccessToken: this._graphAccessToken,
        isDarkTheme: this._isDarkTheme,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        onConfigure: this._onConfigure
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    this._middlewareClient = await this.context.aadHttpClientFactory.getClient('api://spfx-middleware-apis');

    const tenantName: string = this.context.pageContext.site.absoluteUrl.substring(8, this.context.pageContext.site.absoluteUrl.indexOf('sharepoint.com/') + 14);
    const tokenProvider: AadTokenProvider = await this.context.aadTokenProviderFactory.getTokenProvider();
    this._spoAccessToken = await tokenProvider.getToken(`https://${tenantName}`);
    this._graphAccessToken = await tokenProvider.getToken(`https://graph.microsoft.com`);
  }

  private _onConfigure = (): void => {
    // Context of the web part
    this.context.propertyPane.open();
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('middlewareUrl', {
                  label: strings.MiddlewareUrlLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
