import * as React from 'react';
import * as ReactDom from 'react-dom';

import { sp } from "@pnp/sp";
import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";

import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'CovidAdminWebPartStrings';
import CovidAdmin, { ICovidAdminProps } from './components/CovidAdmin';

export interface ICovidAdminWebPartProps {
}

export default class CovidAdminWebPart extends BaseClientSideWebPart<ICovidAdminWebPartProps> {

  public async onInit(): Promise<void> {
    //Initialize PnPLogger
    Logger.subscribe(new ConsoleListener());
    Logger.activeLogLevel = LogLevel.Info;

    //Initialize PnPJs
    sp.setup({ spfxContext: this.context });
  }

  public render(): void {
    const element: React.ReactElement<ICovidAdminProps> = React.createElement(
      CovidAdmin,
      {
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
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
