import {
  BasePrimaryTextCardView,
  IPrimaryTextCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction
} from '@microsoft/sp-adaptive-card-extension-base';
import { IBenefitsAdaptiveCardExtensionProps, IBenefitsAdaptiveCardExtensionState, QUICK_VIEW_REGISTRY_ID } from '../BenefitsAdaptiveCardExtension';

export class CardView extends BasePrimaryTextCardView<IBenefitsAdaptiveCardExtensionProps, IBenefitsAdaptiveCardExtensionState> {

  public get data(): IPrimaryTextCardParameters {
    return {
      primaryText: this.properties.primaryText,
      description: this.properties.description
    };
  }

  public get onCardSelection(): IQuickViewCardAction | IExternalLinkCardAction | undefined {
    return {
      type: 'QuickView',
      parameters: {
        view: QUICK_VIEW_REGISTRY_ID
      }
    };
  }
}
