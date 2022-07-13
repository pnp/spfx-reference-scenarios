import { ISPFxAdaptiveCard, BaseAdaptiveCardView } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'MyMailAdaptiveCardExtensionStrings';
import { Message } from '../models/mymail.models';
import { IMyMailAdaptiveCardExtensionProps, IMyMailAdaptiveCardExtensionState } from '../MyMailAdaptiveCardExtension';

export interface IQuickViewData {
  messages: Message[];
  today: string;
  strings: IMyMailAdaptiveCardExtensionStrings;
}

export class QuickView extends BaseAdaptiveCardView<
  IMyMailAdaptiveCardExtensionProps,
  IMyMailAdaptiveCardExtensionState,
  IQuickViewData
> {
  public get data(): IQuickViewData {
    const today: Date = new Date();
    return {
      messages: this.state.messages,
      today: today.toLocaleDateString(),
      strings: strings
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }
}