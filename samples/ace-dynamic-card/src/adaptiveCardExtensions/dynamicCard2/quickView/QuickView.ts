import { ISPFxAdaptiveCard, BaseAdaptiveCardView } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'DynamicCard2AdaptiveCardExtensionStrings';
import { IDynamicCard2AdaptiveCardExtensionProps, IDynamicCard2AdaptiveCardExtensionState } from '../DynamicCard2AdaptiveCardExtension';

export interface IQuickViewData {
  subTitle: string;
  title: string;
  description: string;
}

export class QuickView extends BaseAdaptiveCardView<
  IDynamicCard2AdaptiveCardExtensionProps,
  IDynamicCard2AdaptiveCardExtensionState,
  IQuickViewData
> {
  public get data(): IQuickViewData {
    return {
      subTitle: strings.SubTitle,
      title: strings.Title,
      description: this.properties.description
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }
}