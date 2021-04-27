import { ISPFxAdaptiveCard, BaseAdaptiveCardView } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'CovidCardAdaptiveCardExtensionStrings';
import { ICovidCardAdaptiveCardExtensionProps, ICovidCardAdaptiveCardExtensionState } from '../CovidCardAdaptiveCardExtension';

export interface IQuickViewData {
  subTitle: string;
  title: string;
  description: string;
}

export class QuickView extends BaseAdaptiveCardView<
  ICovidCardAdaptiveCardExtensionProps,
  ICovidCardAdaptiveCardExtensionState,
  IQuickViewData
> {
  public get data(): IQuickViewData {
    return {
      subTitle: strings.SubTitle,
      title: strings.Title,
      description: this.state.canCheckIn ? strings.CanCheckIn : strings.AlreadyCheckedIn
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }
}