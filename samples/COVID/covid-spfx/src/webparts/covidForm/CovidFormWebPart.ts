import * as React from 'react';
import * as ReactDom from 'react-dom';

import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";
import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";

import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart, IMicrosoftTeams } from '@microsoft/sp-webpart-base';

import * as strings from 'CovidWebPartStrings';
import styles from '../../common/components/CovidForm.module.scss';
import CovidForm, { ICovidFormProps } from '../../common/components/CovidForm';
import { cs } from '../../common/covid.service';
import { CheckInMode } from '../../common/covid.model';

export interface ICovidFormWebPartProps {
  notifications: string;
}

export default class CovidFormWebPart extends BaseClientSideWebPart<ICovidFormWebPartProps> {
  private LOG_SOURCE: string = "🔶CovidFormWebPart";
  private _userId: number = 0;
  private _userCanCheckIn: boolean = false;
  private _microsoftTeams: IMicrosoftTeams;

  public async onInit(): Promise<void> {
    try {
      //Initialize PnPLogger
      Logger.subscribe(new ConsoleListener());
      Logger.activeLogLevel = LogLevel.Info;

      //Initialize PnPJs
      sp.setup({ spfxContext: this.context });
      this._microsoftTeams = this.context.sdks?.microsoftTeams;

      await cs.init();

      const user = await sp.web.ensureUser(this.context.pageContext.user.loginName);
      this._userId = user.data.Id;
      this._userCanCheckIn = await cs.userCanCheckIn(this._userId);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (onInit) - ${err}`, LogLevel.Error);
    }
  }

  //TODO: Better message/styling for already submitted form message.
  public render(): void {
    try {
      if (cs.Ready) {
        let element;
        //if (this._userCanCheckIn) {
        const props: ICovidFormProps = {
          microsoftTeams: this._microsoftTeams,
          checkInMode: CheckInMode.Self,
          displayName: this.context.pageContext.user.displayName,
          userId: this._userId
        };
        element = React.createElement(CovidForm, props);
        //} else {
        //  element = React.createElement("div", null, "You have already submitted your COVID Attestation today.");
        //}
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

  //TODO: Clean out if not used.
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
              groupFields: [
              ]
            }
          ]
        }
      ]
    };
  }
}
