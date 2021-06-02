import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';

import { sp } from "@pnp/sp";
import { graph } from "@pnp/graph";
import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";

import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { TeamTimezonePropertyPane } from './TeamTimezonePropertyPane';
import { CONFIG_TYPE, IConfig } from '../../webparts/worldClock/models/wc.models';
import { wc } from '../../webparts/worldClock/services/wc.service';

export interface ITeamTimezoneAdaptiveCardExtensionProps {
  title: string;
  iconProperty: string;
}

export interface ITeamTimezoneAdaptiveCardExtensionState {
  currentConfig: IConfig;
  currentView: string;
  teamsUrl: string;
}

const CARD_VIEW_REGISTRY_ID: string = 'TEAMTIMEZONE_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'TEAMTIMEZONE_QUICK_VIEW';

export default class TeamTimezoneAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  ITeamTimezoneAdaptiveCardExtensionProps,
  ITeamTimezoneAdaptiveCardExtensionState
> {
  private LOG_SOURCE: string = "🔶TeamTimezoneAdaptiveCardExtension";

  private _deferredPropertyPane: TeamTimezonePropertyPane | undefined;

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

      //TODO: Get Teams URL
      this.state = {
        currentConfig: wc.Config,
        currentView: wc.Config.defaultViewId,
        teamsUrl: "https://teams.microsoft.com/l/entity/2c3960eb-ca53-4e0e-8e90-e3258f788999/0"
      };
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (onInit) - ${err.message} - `, LogLevel.Error);
    }

    return Promise.resolve();
  }

  protected get iconProperty(): string {
    return require('../../../teams/2c3960eb-ca53-4e0e-8e90-e3258f788999_color.png');
  }

  protected loadPropertyPaneResources(): Promise<void> {
    return import(
      /* webpackChunkName: 'TeamTimezone-property-pane'*/
      './TeamTimezonePropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.TeamTimezonePropertyPane();
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
