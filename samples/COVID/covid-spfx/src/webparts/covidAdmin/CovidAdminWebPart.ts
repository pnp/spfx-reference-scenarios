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

import * as strings from 'CovidWebPartStrings';
import styles from '../../common/components/CovidForm.module.scss';
import CovidAdmin, { ICovidAdminProps } from './components/CovidAdmin';
import { cs } from '../../common/covid.service';

export interface ICovidAdminWebPartProps {
}

export default class CovidAdminWebPart extends BaseClientSideWebPart<ICovidAdminWebPartProps> {
  private LOG_SOURCE: string = "🔶CovidAdminWebPart";

  public async onInit(): Promise<void> {
    //Initialize PnPLogger
    Logger.subscribe(new ConsoleListener());
    Logger.activeLogLevel = LogLevel.Info;

    //Initialize PnPJs
    sp.setup({ spfxContext: this.context });

    cs.init();
  }

  public render(): void {
    const element: React.ReactElement<ICovidAdminProps> = React.createElement(
      CovidAdmin,
      {
      }
    );

    this.domElement.className = styles.appPartPage;
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  //TODO: Clean up if not using property pane.
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: ""
          },
          groups: [
            {
              groupName: "",
              groupFields: []
            }
          ]
        }
      ]
    };
  }
}
