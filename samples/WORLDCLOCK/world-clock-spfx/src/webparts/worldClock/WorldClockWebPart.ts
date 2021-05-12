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
import * as strings from 'WorldClockWebPartStrings';
import WorldClock, { IWorldClockProps } from './components/WorldClock';
import { wc } from './services/wc.service';
import { IWebEnsureUserResult } from "@pnp/sp/site-users/";
import { CONFIG_TYPE } from './models/wc.models';

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
      //TODO: Julie can you please double check this. I had to make changes for the search members to work.
      graph.setup({
        graph: {
          headers: { ConsistencyLevel: "eventual" }
        },
        spfxContext: this.context
      });

      // const siteValid = await wcc.isValid();
      // if (siteValid) {
      await this._init();
      //}
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (onInit) - ${err}`, LogLevel.Error);
    }
  }

  private async _init(): Promise<void> {
    try {
      this._microsoftTeams = this.context.sdks?.microsoftTeams;
      //TODO: CLEAN UP AFTER TESTED IN TEAMS
      const configType: CONFIG_TYPE = (this._microsoftTeams?.context?.groupId) ? CONFIG_TYPE.Team : CONFIG_TYPE.Personal;
      await wc.Init(this.context.pageContext.user.loginName, this.context.pageContext.cultureInfo.currentUICultureName, this.context.pageContext.site.serverRelativeUrl, this._microsoftTeams?.context?.groupId, this._microsoftTeams?.context?.teamName, configType);
      // Consume the new ThemeProvider service
      this._themeProvider = this.context.serviceScope.consume(ThemeProvider.serviceKey);
      this._themeVariant = this._themeProvider.tryGetTheme();
      if (this._themeVariant) {
        // we set transfer semanticColors into CSS variables
        this._setCSSVariables(this._themeVariant.semanticColors);
      } else if (window["__themeState__"].theme) {
        // we set transfer semanticColors into CSS variables
        this._setCSSVariables(window["__themeState__"].theme);
      }
      this._themeProvider.themeChangedEvent.add(this, this._handleThemeChangedEvent);

      if (this._microsoftTeams) {
        if (this._microsoftTeams.context.theme == "default") {
          this.domElement.style.setProperty("--bodyBackground", "whitesmoke");
        }
        else {
          this.domElement.style.setProperty("--bodyText", "white");
          this.domElement.style.setProperty("--bodyBackground", "#333");
          this.domElement.style.setProperty("--buttonBackgroundHovered", "#555");
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

  public render(): void {
    try {
      let element;
      if (wc.Ready) {
        const props: IWorldClockProps = {
          userId: this._userId
        };
        element = React.createElement(WorldClock, props);
      } else {
        //TODO: Render error
      }
      this.domElement.className = styles.appPartPage;
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
