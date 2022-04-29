import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart, IMicrosoftTeams } from '@microsoft/sp-webpart-base';
import {
  ThemeProvider,
  ThemeChangedEventArgs,
  IReadonlyTheme,
} from '@microsoft/sp-component-base';
//import { sp } from "@pnp/sp";
import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";

import AceDesignTemplatePersonalApp from './components/ACEGalleryPersonalApp';
import { darkModeTheme, highContrastTheme, lightModeTheme } from '../../common/models/teamsapps.themes';
import { dtg } from '../../common/services/designtemplate.service';
import styles from './components/AceDesignTemplatePersonalApp.module.scss';
import { AppData, DeepLinkData } from '../../common/models/designtemplate.models';

export interface IACEGalleryAppPartProps {
  appData: AppData;
  deepLink: DeepLinkData;
  appList: AppData[];
}

export default class ACEGalleryAppPart extends BaseClientSideWebPart<IACEGalleryAppPartProps> {

  private LOG_SOURCE: string = "🔶 ACEGalleryAppPart";
  private _microsoftTeams: IMicrosoftTeams;
  private _linkData: DeepLinkData;
  private _appData: AppData = null;
  private _appList: AppData[];

  /** Used for theming */
  private _themeProvider: ThemeProvider;
  private _themeVariant: IReadonlyTheme | undefined;

  public async onInit(): Promise<void> {
    try {
      //Initialize PnPLogger
      Logger.subscribe(new ConsoleListener());
      Logger.activeLogLevel = LogLevel.Info;

      dtg.Init();

      //Initialize PnPJs
      //sp.setup({ spfxContext: this.context });
      this._microsoftTeams = this.context.sdks?.microsoftTeams;

      // Consume the new ThemeProvider service
      this._themeProvider = this.context.serviceScope.consume(ThemeProvider.serviceKey);
      // If it exists, get the theme variant
      this._themeVariant = this._themeProvider.tryGetTheme();

      // Assign theme slots
      if (this._themeVariant) {

        // output all theme theme variants
        console.log("LOG Theme variant:::", this._themeVariant);

        // transfer semanticColors into CSS variables
        this._setCSSVariables(this._themeVariant.semanticColors);

        // transfer fonts into CSS variables
        this._setCSSVariables(this._themeVariant.fonts);

        // transfer color palette into CSS variables
        this._setCSSVariables(this._themeVariant.palette);

        // transfer color palette into CSS variables
        this._setCSSVariables(this._themeVariant["effects"]);

      } else {

        // Fallback to core theme state options applicable for Single Canvas Apps and Microsoft Teams
        this._setCSSVariables(window["__themeState__"].theme);

      }
      // Register a handler to be notified if the theme variant changes
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
      } else {
        this._setCSSVariables(lightModeTheme);
      }

      this._init();
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (onInit) - ${err}`, LogLevel.Error);
    }
  }

  private async _init(): Promise<void> {
    try {
      if (this._microsoftTeams) {
        this._getTeamsQueryString();
        this._appList = dtg.GetAllApps();
      }
      this.render();
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_init) - ${err}`, LogLevel.Error);
    }
  }

  private _getTeamsQueryString(): void {
    try {
      // Get configuration from the Teams SDK
      if (this._microsoftTeams.context) {
        console.log(this._microsoftTeams.context);
        if (this._microsoftTeams.context.subEntityId?.toString() != "") {
          const subEntityId: any = this._microsoftTeams.context.subEntityId;

          this._linkData = dtg.GetDeepLinkData(subEntityId, this.context.pageContext.cultureInfo.currentUICultureName);
          this._appData = dtg.GetAppData(subEntityId.appName);
        }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_getTeamsQueryString) - ${err} -- Error loading query string parameters from teams context.`, LogLevel.Error);
    }
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

  // Handle all theme changes
  private _handleThemeChangedEvent(args: ThemeChangedEventArgs): void {
    this._themeVariant = args.theme;
  }

  public render(): void {
    try {
      let element;
      let teams: IMicrosoftTeams = this._microsoftTeams;
      const props: IACEGalleryAppPartProps = { appData: this._appData, deepLink: this._linkData, appList: this._appList };
      element = React.createElement(AceDesignTemplatePersonalApp, props);

      this.domElement.classList.add(styles.appPartPage);
      ReactDom.render(element, this.domElement);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  // protected get dataVersion(): Version {
  //   return Version.parse('1.0');
  // }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return;
  }
}
