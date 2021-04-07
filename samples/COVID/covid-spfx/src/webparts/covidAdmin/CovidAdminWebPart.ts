import * as React from 'react';
import * as ReactDom from 'react-dom';

import { sp } from "@pnp/sp";
import { graph } from "@pnp/graph";
import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";

import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneSlider,
  PropertyPaneLabel
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { MSGraphClient } from '@microsoft/sp-http';

import * as strings from 'CovidWebPartStrings';
import styles from '../../common/components/CovidForm.module.scss';
import CovidAdmin, { ICovidAdminProps } from './components/CovidAdmin';
import { cs } from '../../common/covid.service';
import { ccs } from '../../common/covidConfig.service';
import Configure, { IConfigureProps } from './components/Configure';

export interface ICovidAdminWebPartProps {
  moveCheckingRate: number;
  notifyGroup: string;
}

export default class CovidAdminWebPart extends BaseClientSideWebPart<ICovidAdminWebPartProps> {
  private LOG_SOURCE: string = "🔶CovidAdminWebPart";
  private _userId: number = 0;
  private _graphClient: MSGraphClient;

  public async onInit(): Promise<void> {
    try {
      //Initialize PnPLogger
      Logger.subscribe(new ConsoleListener());
      Logger.activeLogLevel = LogLevel.Info;

      //Initialize PnPJs
      sp.setup({ spfxContext: this.context });
      graph.setup({ spfxContext: this.context });

      const siteValid = await ccs.isValid();
      if (siteValid) {
        await this._init();
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (onInit) - ${err}`, LogLevel.Error);
    }
  }

  private async _init(): Promise<void> {
    try {
      if (this._graphClient == null)
        this._graphClient = await this.context.msGraphClientFactory.getClient();
      await cs.init(this._graphClient);
      const user = await sp.web.ensureUser(this.context.pageContext.user.loginName);
      this._userId = user.data.Id;
      cs.getCheckIns(new Date());
      this.processSelfCheckins();
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_init) - ${err}`, LogLevel.Error);
    }
  }

  private async delay(ms: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async processSelfCheckins(): Promise<void> {
    while (true) {
      const delay: number = (this.properties.moveCheckingRate == null) ? 60000 : (this.properties.moveCheckingRate * 60000);
      await this.delay(delay);
      await cs.moveSelfCheckIns();
    }
  }

  public render(): void {
    try {
      let element;
      if (!ccs.Valid) {
        const props: IConfigureProps = { startConfigure: this._configure };
        element = React.createElement(Configure, props);
      } else if (cs.Ready) {
        const props: ICovidAdminProps = {
          loginName: this.context.pageContext.user.loginName,
          displayName: this.context.pageContext.user.displayName,
          userId: this._userId
        };
        element = React.createElement(CovidAdmin, props);
      } else {
        //TODO: Render error
      }
      this.domElement.className = styles.appPartPage;
      ReactDom.render(element, this.domElement);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
    }
  }

  private _configure = async (): Promise<void> => {
    try {
      const success = await ccs.configure();
      if (success) {
        await this._init();
        this.render();
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_configure) - ${err} - `, LogLevel.Error);
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
          groups: [
            {
              groupName: "Configuration",
              groupFields: [
                PropertyPaneTextField("notifyGroup", {
                  label: "Email Notification Group"
                }),
                PropertyPaneLabel("", { text: "Employee Check-In Update (mins)" }),
                PropertyPaneSlider("moveCheckingRate", {
                  min: 1,
                  max: 60
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
