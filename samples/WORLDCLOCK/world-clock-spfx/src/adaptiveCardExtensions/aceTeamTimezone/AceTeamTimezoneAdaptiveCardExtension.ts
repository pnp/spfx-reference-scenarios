import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';

import { sp } from "@pnp/sp";
import { graph } from "@pnp/graph";
import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";

import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { AceTeamTimezonePropertyPane } from './AceTeamTimezonePropertyPane';
import { CONFIG_TYPE, IConfig } from '../../webparts/worldClock/models/wc.models';
import { wc } from '../../webparts/worldClock/services/wc.service';

export interface IAceTeamTimezoneAdaptiveCardExtensionProps {

}

export interface IAceTeamTimezoneAdaptiveCardExtensionState {
  currentConfig: IConfig;
  currentView: string;
  teamsUrl: string;
}

const CARD_VIEW_REGISTRY_ID: string = 'AceTeamTimezone_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'AceTeamTimezone_QUICK_VIEW';

export default class AceTeamTimezoneAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IAceTeamTimezoneAdaptiveCardExtensionProps,
  IAceTeamTimezoneAdaptiveCardExtensionState
> {
  private LOG_SOURCE: string = "🔶AceTeamTimezoneAdaptiveCardExtension";

  private _deferredPropertyPane: AceTeamTimezonePropertyPane | undefined;

  public async onInit(): Promise<void> {
    try {
      this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
      this.quickViewNavigator.register(QUICK_VIEW_REGISTRY_ID, () => new QuickView());

      //Initialize PnPLogger
      Logger.subscribe(new ConsoleListener());
      Logger.activeLogLevel = LogLevel.Info;

      //Initialize PnPJs
      sp.setup({ spfxContext: this.context });
      graph.setup({ spfxContext: this.context });

      const configType: CONFIG_TYPE = CONFIG_TYPE.Personal;
      await wc.Init(this.context.pageContext.user.loginName, this.context.pageContext.cultureInfo.currentUICultureName, "", null, null, configType);

      this.state = {
        currentConfig: wc.Config,
        currentView: wc.Config.defaultViewId,
        teamsUrl: "https://bing.com"
      };
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (onInit) - ${err.message} - `, LogLevel.Error);
    }

    return Promise.resolve();
  }

  // public get TeamsUrl(): string {
  //   return this.properties.teamsUrl;
  // }

  // protected get iconProperty(): string {
  //   return this.properties.iconProperty || require('./assets/SharePointLogo.svg');
  // }

  protected loadPropertyPaneResources(): Promise<void> {
    return import(
      /* webpackChunkName: 'AceTeamTimezone-property-pane'*/
      './AceTeamTimezonePropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.AceTeamTimezonePropertyPane();
        }
      );
  }

  protected renderCard(): string | undefined {
    return CARD_VIEW_REGISTRY_ID;
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return this._deferredPropertyPane!.getPropertyPaneConfiguration();
  }

  // tslint:disable-next-line: no-any
  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {

  }
}
