import { ISPFxAdaptiveCard, BaseAdaptiveCardView } from '@microsoft/sp-adaptive-card-extension-base';
import { Benefits } from '../../../common/models/designtemplate.models';
import { IBenefitsAdaptiveCardExtensionProps, IBenefitsAdaptiveCardExtensionState } from '../BenefitsAdaptiveCardExtension';

export interface IQuickViewData {
  benefits: Benefits;
}

export class QuickView extends BaseAdaptiveCardView<
  IBenefitsAdaptiveCardExtensionProps,
  IBenefitsAdaptiveCardExtensionState,
  IQuickViewData
> {
  public get data(): IQuickViewData {
    return {
      benefits: this.state.benefits
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }
}