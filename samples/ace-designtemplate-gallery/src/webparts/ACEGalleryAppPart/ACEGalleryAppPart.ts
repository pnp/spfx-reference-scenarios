import * as React from 'react';
import * as ReactDom from 'react-dom';
import {
  IPropertyPaneConfiguration
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart, IMicrosoftTeams } from '@microsoft/sp-webpart-base';
import {
  ThemeProvider,
  ThemeChangedEventArgs,
  IReadonlyTheme,
} from '@microsoft/sp-component-base';

import AceDesignTemplatePersonalApp from './components/ACEGalleryPersonalApp';
import { darkModeTheme, highContrastTheme, lightModeTheme } from '../../common/models/teamsapps.themes';
import styles from './components/AceDesignTemplatePersonalApp.module.scss';
import { AppData, DeepLinkData } from '../../common/models/designtemplate.models';
import { dtg } from '../../common/services/designtemplate.service';

export interface IACEGalleryAppPartProps {
  appData: AppData;
  deepLink: DeepLinkData;
  appList: AppData[];
}

export default class ACEGalleryAppPart extends BaseClientSideWebPart<IACEGalleryAppPartProps> {

  private LOG_SOURCE = "🔶 ACEGalleryAppPart";
  private _microsoftTeams: IMicrosoftTeams;
  private _linkData: DeepLinkData;
  private _appData: AppData = null;
  private _appList: AppData[];

  /** Used for theming */
  private _themeProvider: ThemeProvider;
  private _themeVariant: IReadonlyTheme | undefined;

  public async onInit(): Promise<void> {
    try {
      //Initialize Service
      await dtg.Init(this.context.serviceScope);

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
        this._setCSSVariables(this._themeVariant.effects);

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
      console.error(
        `${this.LOG_SOURCE} (onInit) -- webpart not initialized. - ${err}`
      );
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
      console.error(
        `${this.LOG_SOURCE} (_init) - ${err}`
      );
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
      console.error(
        `${this.LOG_SOURCE} (_getTeamsQueryString) - Error loading query string parameters from teams context. ${err}`
      );
    }
  }

  private _setCSSVariables(theming: any) {
    const themingKeys = Object.keys(theming);
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
      const props: IACEGalleryAppPartProps = { appData: this._appData, deepLink: this._linkData, appList: this._appList };
      const element = React.createElement(AceDesignTemplatePersonalApp, props);

      this.domElement.classList.add(styles.appPartPage);
      ReactDom.render(element, this.domElement);
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (render) - Error rendering web part. ${err}`
      );
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
