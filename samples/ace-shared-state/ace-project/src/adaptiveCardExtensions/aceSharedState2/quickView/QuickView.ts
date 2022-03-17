import { ISPFxAdaptiveCard, BaseAdaptiveCardView } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'AceSharedState2AdaptiveCardExtensionStrings';
import { IAceSharedState2AdaptiveCardExtensionProps, IAceSharedState2AdaptiveCardExtensionState } from '../AceSharedState2AdaptiveCardExtension';

export interface IQuickViewData {
  subTitle: string;
  title: string;
  description: string;
}

export class QuickView extends BaseAdaptiveCardView<
  IAceSharedState2AdaptiveCardExtensionProps,
  IAceSharedState2AdaptiveCardExtensionState,
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