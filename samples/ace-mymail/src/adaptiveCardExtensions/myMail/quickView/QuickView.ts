import { ISPFxAdaptiveCard, BaseAdaptiveCardView } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'MyMailAdaptiveCardExtensionStrings';
import { IMyMailAdaptiveCardExtensionProps, IMyMailAdaptiveCardExtensionState } from '../MyMailAdaptiveCardExtension';

export interface IQuickViewData {
  subTitle: string;
  title: string;
  strings: IMyMailAdaptiveCardExtensionStrings
}

export class QuickView extends BaseAdaptiveCardView<
  IMyMailAdaptiveCardExtensionProps,
  IMyMailAdaptiveCardExtensionState,
  IQuickViewData
> {
  public get data(): IQuickViewData {
    return {
      subTitle: strings.SubTitle,
      title: strings.Title,
      strings: strings
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }
}