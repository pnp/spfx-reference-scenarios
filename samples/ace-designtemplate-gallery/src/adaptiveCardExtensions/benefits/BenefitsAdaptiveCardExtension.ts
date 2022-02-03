import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { BenefitsPropertyPane } from './BenefitsPropertyPane';

import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";
import { sp } from "@pnp/sp";
import { dtg } from '../../common/services/designtemplate.service';
import { App, Benefits } from '../../common/models/designtemplate.models';

export interface IBenefitsAdaptiveCardExtensionProps {
  title: string;
  primaryText: string;
  description: string;
  iconProperty: string;
}

export interface IBenefitsAdaptiveCardExtensionState {
  benefits: Benefits;
}

const CARD_VIEW_REGISTRY_ID: string = 'Benefits_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'Benefits_QUICK_VIEW';

export default class BenefitsAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IBenefitsAdaptiveCardExtensionProps,
  IBenefitsAdaptiveCardExtensionState
> {
  private LOG_SOURCE: string = "🔶 Benefits Adaptive Card Extension";
  private _deferredPropertyPane: BenefitsPropertyPane | undefined;

  public onInit(): Promise<void> {
    try {
      //Initialize PnPLogger
      Logger.subscribe(new ConsoleListener());
      Logger.activeLogLevel = LogLevel.Info;

      //Initialize PnPJs
      sp.setup({ spfxContext: this.context });

      dtg.Init();

      const benefitsApp: App = dtg.GetBenefits();

      this.state = {
        benefits: benefitsApp.cardData
      };

      this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
      this.quickViewNavigator.register(QUICK_VIEW_REGISTRY_ID, () => new QuickView());
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (onInit) - ${err}`, LogLevel.Error);
    }
    return Promise.resolve();
  }

  public get title(): string {
    return this.properties.title;
  }

  protected get iconProperty(): string {
    return this.properties.iconProperty || require('./assets/SharePointLogo.svg');
  }

  protected loadPropertyPaneResources(): Promise<void> {
    return import(
      /* webpackChunkName: 'Benefits-property-pane'*/
      './BenefitsPropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.BenefitsPropertyPane();
        }
      );
  }

  protected renderCard(): string | undefined {
    return CARD_VIEW_REGISTRY_ID;
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return this._deferredPropertyPane!.getPropertyPaneConfiguration();
  }
}
