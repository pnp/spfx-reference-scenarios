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
  IPropertyPaneConfiguration
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart, IMicrosoftTeams } from '@microsoft/sp-webpart-base';

import styles from "./components/RoomReservation.module.scss";
import RoomReservation, { IRoomReservationProps } from './components/RoomReservation';
import { darkModeTheme, highContrastTheme, lightModeTheme } from './models/rr.themes';
import { rr } from './services/rr.service';


export interface IRoomReservationWebPartProps {
  description: string;
}

export default class RoomReservationWebPart extends BaseClientSideWebPart<IRoomReservationWebPartProps> {
  private LOG_SOURCE: string = "🔶 RoomReservationWebPart";
  private _microsoftTeams: IMicrosoftTeams;

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

      this._init();
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (onInit) - ${err}`, LogLevel.Error);
    }
  }

  private async _init(): Promise<void> {
    try {
      this._microsoftTeams = this.context.sdks?.microsoftTeams;
      await rr.Init(this.context.pageContext.cultureInfo.currentUICultureName);
      rr.HandleExecuteDeepLink = this._handleExecuteDeepLink;

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
      if (rr.Ready) {
        const props: IRoomReservationProps = { loading: false };
        element = React.createElement(RoomReservation, props);
      } else {
        const props: IRoomReservationProps = { loading: true };
        element = React.createElement(RoomReservation, props);
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
