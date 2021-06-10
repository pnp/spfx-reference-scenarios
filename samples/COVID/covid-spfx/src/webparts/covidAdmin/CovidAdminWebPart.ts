import * as React from 'react';
import * as ReactDom from 'react-dom';

import { sp } from "@pnp/sp";
import { graph } from "@pnp/graph";
import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";
import {
  ThemeProvider,
  ThemeChangedEventArgs,
  IReadonlyTheme
} from '@microsoft/sp-component-base';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart, IMicrosoftTeams } from '@microsoft/sp-webpart-base';

import styles from './components/CovidAdmin.module.scss';
import CovidAdmin, { ICovidAdminProps } from './components/CovidAdmin';
import { cs } from './services/covid.service';
import { ccs } from './services/covidConfig.service';
import Configure, { IConfigureProps } from './components/molecules/Configure';
import { SECURITY } from './models/covid.model';
import { darkModeTheme, highContrastTheme, lightModeTheme } from './models/covid.themes';

export interface ICovidAdminWebPartProps {
  moveCheckingRate: number;
}

export default class CovidAdminWebPart extends BaseClientSideWebPart<ICovidAdminWebPartProps> {
  private LOG_SOURCE: string = "🔶CovidAdminWebPart";
  private MOVE_CHECKIN_RATE: number = 5;
  private _userId: number = 0;
  private _microsoftTeams: IMicrosoftTeams;
  private _userCanCheckIn: boolean = false;
  /** Used for theming */
  private _themeProvider: ThemeProvider;
  private _themeVariant: IReadonlyTheme | undefined;

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
      await cs.init(this.context.pageContext.site.absoluteUrl, this.context.pageContext.user.loginName, this.context.pageContext.legacyPageContext.isSiteAdmin, this.context.pageContext.legacyPageContext.isSiteOwner);
      this._userId = this.context.pageContext.legacyPageContext.userId;
      if (this._userId == undefined) {
        const user = await sp.web.ensureUser(this.context.pageContext.user.loginName);
        this._userId = user.data.Id;
      }
      this._userCanCheckIn = await cs.userCanCheckIn(this._userId);
      cs.getCheckIns(new Date());
      if (cs.Security != SECURITY.VISITOR) {
        this.processSelfCheckins();
      }


      // Consume the new ThemeProvider service
      this._themeProvider = this.context.serviceScope.consume(ThemeProvider.serviceKey);
      this._themeVariant = this._themeProvider.tryGetTheme();
      if (this._themeVariant) {
        // transfer semanticColors into CSS variables
        this._setCSSVariables(this._themeVariant.semanticColors);

        // transfer fonts into CSS variables
        this._setCSSVariables(this._themeVariant.fonts);

        // transfer color palette into CSS variables
        this._setCSSVariables(this._themeVariant.palette);

        // transfer color palette into CSS variables
        this._setCSSVariables(this._themeVariant["effects"]);
      } else if (window["__themeState__"].theme) {
        // we set transfer semanticColors into CSS variables
        this._setCSSVariables(window["__themeState__"].theme);
      }
      this._themeProvider.themeChangedEvent.add(this, this._handleThemeChangedEvent);

      // if (this._microsoftTeams) {
      //   if (this._microsoftTeams.context.theme !== "default") {
      //     this.domElement.style.setProperty("--bodyText", "white");
      //     this.domElement.style.setProperty("--bodyBackground", "#333");
      //     this.domElement.style.setProperty("--buttonBackgroundHovered", "#555");
      //   }
      // }

      if (this._microsoftTeams) {
        switch (this._microsoftTeams.context.theme) {
          case "dark": {
            this.domElement.classList.add("dark-mode");
            this._setCSSVariables(darkModeTheme);
            break;
          }
          case "contrast": {
            this.domElement.classList.add("contrast-mode");
            this._setCSSVariables(highContrastTheme);
            break;
          }
          default: {
            this._setCSSVariables(lightModeTheme);
            break;
          }
        }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_init) - ${err}`, LogLevel.Error);
    }
  }

  private _handleThemeChangedEvent(args: ThemeChangedEventArgs): void {
    this._themeVariant = args.theme;
    this._setCSSVariables(this._themeVariant.semanticColors);
    this._setCSSVariables(this._themeVariant.palette);
  }

  private _setCSSVariables(theming: any) {
    let themingKeys = Object.keys(theming);
    if (themingKeys !== null) {
      themingKeys.forEach(key => {
        // add CSS variable to style property of the web part
        this.domElement.style.setProperty(`--${key}`, theming[key]);
      });
    }
  }

  private async delay(ms: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async processSelfCheckins(): Promise<void> {
    while (true) {
      await cs.moveSelfCheckIns();
      const delay: number = (this.MOVE_CHECKIN_RATE * 60000);
      await this.delay(delay);
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
      this.domElement.classList.add(styles.appPartPage);
      ReactDom.render(element, this.domElement);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
    }
  }

  private _configure = async (demoData: boolean): Promise<void> => {
    try {
      const success = await ccs.configure(demoData);
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

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: []
    };
  }
}
