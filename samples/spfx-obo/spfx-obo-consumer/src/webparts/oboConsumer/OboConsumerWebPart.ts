import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'OboConsumerWebPartStrings';
import OboConsumer from './components/OboConsumer';
import { IOboConsumerProps } from './components/IOboConsumerProps';

import { AadHttpClient } from '@microsoft/sp-http';
import { Providers, SharePointProvider } from '@microsoft/mgt-spfx';

export interface IOboConsumerWebPartProps {
  middlewareUrl: string;
}

export default class OboConsumerWebPart extends BaseClientSideWebPart<IOboConsumerWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _middlewareClient: AadHttpClient;

  public render(): void {
    const element: React.ReactElement<IOboConsumerProps> = React.createElement(
      OboConsumer,
      {
        middlewareUrl: this.properties.middlewareUrl,
        middlewareClient: this._middlewareClient,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        isDarkTheme: this._isDarkTheme,
        onConfigure: this._onConfigure
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {

    this._middlewareClient = await this.context.aadHttpClientFactory.getClient('api://spfx-obo-middleware');

    if (!Providers.globalProvider) {
      Providers.globalProvider = new SharePointProvider(this.context);
    }
    
    return super.onInit();
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
                  label: strings.MiddlewareUrlFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
