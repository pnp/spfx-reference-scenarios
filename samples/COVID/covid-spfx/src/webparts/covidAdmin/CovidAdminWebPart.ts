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
  private _userId: number = 0;

  public async onInit(): Promise<void> {
    //Initialize PnPLogger
    Logger.subscribe(new ConsoleListener());
    Logger.activeLogLevel = LogLevel.Info;

    //Initialize PnPJs
    sp.setup({ spfxContext: this.context });

    await cs.init();
    const user = await sp.web.ensureUser(this.context.pageContext.user.loginName);
    this._userId = user.data.Id;
    cs.getCheckIns(new Date());
    this.processSelfCheckins();
  }

  private async delay(ms: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async processSelfCheckins(): Promise<void> {
    while (true) {
      await this.delay(60000);
      await cs.moveSelfCheckIns();
    }
  }

  public render(): void {
    try {
      if (cs.Ready) {
        const element: React.ReactElement<ICovidAdminProps> = React.createElement(
          CovidAdmin,
          {
            loginName: this.context.pageContext.user.loginName,
            displayName: this.context.pageContext.user.displayName,
            userId: this._userId
          }
        );

        this.domElement.className = styles.appPartPage;
        ReactDom.render(element, this.domElement);
      } else {
        //TODO: Render error
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
    }
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
