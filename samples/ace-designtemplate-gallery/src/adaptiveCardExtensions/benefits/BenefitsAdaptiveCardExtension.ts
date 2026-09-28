import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { BenefitsPropertyPane } from './BenefitsPropertyPane';

import { dtg } from '../../common/services/designtemplate.service';
import { Benefits } from '../../common/models/designtemplate.models';

export interface IBenefitsAdaptiveCardExtensionProps {
  iconProperty: string;
  title: string;
}

export interface IBenefitsAdaptiveCardExtensionState {
  benefits: Benefits;
}

const CARD_VIEW_REGISTRY_ID = 'Benefits_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID = 'Benefits_QUICK_VIEW';

export default class BenefitsAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IBenefitsAdaptiveCardExtensionProps,
  IBenefitsAdaptiveCardExtensionState
> {
  private LOG_SOURCE = "🔶 Benefits Adaptive Card Extension";
  private _deferredPropertyPane: BenefitsPropertyPane | undefined;

  public async onInit(): Promise<void> {
    try {
      //Initialize Service
      await dtg.Init(this.context.serviceScope);

      //Get the data for the app
      const benefitsApp: Benefits = dtg.GetBenefits();

      //Set the data into state
      this.state = {
        benefits: benefitsApp
      };

      //Register the cards
      this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
      this.quickViewNavigator.register(QUICK_VIEW_REGISTRY_ID, () => new QuickView());
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (onInit) -- Could not initialize web part. - ${err}`
      );
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
