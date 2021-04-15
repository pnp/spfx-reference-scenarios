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
import { BaseClientSideWebPart, IMicrosoftTeams } from '@microsoft/sp-webpart-base';

import styles from './components/CovidAdmin.module.scss';
import CovidAdmin, { ICovidAdminProps } from './components/CovidAdmin';
import { cs } from './services/covid.service';
import { ccs } from './services/covidConfig.service';
import Configure, { IConfigureProps } from './components/molecules/Configure';

export interface ICovidAdminWebPartProps {
  moveCheckingRate: number;
  notifyGroup: string;
}

export default class CovidAdminWebPart extends BaseClientSideWebPart<ICovidAdminWebPartProps> {
  private LOG_SOURCE: string = "🔶CovidAdminWebPart";
  private _userId: number = 0;
  private _microsoftTeams: IMicrosoftTeams;
  private _userCanCheckIn: boolean = false;

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
      this._microsoftTeams = this.context.sdks?.microsoftTeams;
      await cs.init(this.context.pageContext.site.absoluteUrl);
      const user = await sp.web.ensureUser(this.context.pageContext.user.loginName);
      this._userId = user.data.Id;
      this._userCanCheckIn = await cs.userCanCheckIn(this._userId);
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
          microsoftTeams: this._microsoftTeams,
          loginName: this.context.pageContext.user.loginName,
          displayName: this.context.pageContext.user.displayName,
          userId: this._userId,
          userCanCheckIn: this._userCanCheckIn
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
