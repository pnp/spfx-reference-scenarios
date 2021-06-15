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

import styles from "./components/WorldClock.module.scss";
import WorldClock, { IWorldClockProps } from './components/WorldClock';
import { wc } from './services/wc.service';
import { CONFIG_TYPE } from './models/wc.models';
import { darkModeTheme, highContrastTheme, lightModeTheme } from './models/wc.themes';

export interface IWorldClockWebPartProps {
  description: string;
}

export default class WorldClockWebPart extends BaseClientSideWebPart<IWorldClockWebPartProps> {
  private LOG_SOURCE: string = "🔶WorldClockWebPart";

  private _microsoftTeams: IMicrosoftTeams;
  private _userId: string = "";

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

      this._init();
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (onInit) - ${err}`, LogLevel.Error);
    }
  }

  private async _init(): Promise<void> {
    try {
      this._microsoftTeams = this.context.sdks?.microsoftTeams;
      const configType: CONFIG_TYPE = (this._microsoftTeams?.context?.groupId) ? CONFIG_TYPE.Team : CONFIG_TYPE.Personal;
      await wc.Init(this.context.pageContext.user.loginName, this.context.pageContext.cultureInfo.currentUICultureName, this.context.pageContext.site.serverRelativeUrl, this._microsoftTeams?.context?.groupId, this._microsoftTeams?.context?.teamName, configType);
      wc.HandleExecuteDeepLink = this._handleExecuteDeepLink;
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
      this.render();
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_init) - ${err}`, LogLevel.Error);
    }
  }

  private _handleExecuteDeepLink = (meetingUrl: string): void => {
    try {
      if (this._microsoftTeams) {
        this._microsoftTeams.teamsJs.executeDeepLink(meetingUrl);
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_handleExecuteDeepLink) - ${err}`, LogLevel.Error);
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

  public render(): void {
    try {
      let element;
      if (wc.Ready) {
        const props: IWorldClockProps = { loading: false };
        element = React.createElement(WorldClock, props);
      } else {
        const props: IWorldClockProps = { loading: true };
        element = React.createElement(WorldClock, props);
      }
      this.domElement.classList.add(styles.appPartPage);
      ReactDom.render(element, this.domElement);
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

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: []
    };
  }
}
