import { ISPFxAdaptiveCard, BaseAdaptiveCardView } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'TimelineholidayAdaptiveCardExtensionStrings';
import { Holiday } from '../../../common/models/designtemplate.models';
import { ITimelineholidayAdaptiveCardExtensionProps, ITimelineholidayAdaptiveCardExtensionState } from '../TimelineholidayAdaptiveCardExtension';

export interface IQuickViewData {
  holidays: Holiday[];
  years: number[];
  today: Date;
  timelineImage: string;
}

export class QuickView extends BaseAdaptiveCardView<
  ITimelineholidayAdaptiveCardExtensionProps,
  ITimelineholidayAdaptiveCardExtensionState,
  IQuickViewData
> {
  public get data(): IQuickViewData {


    return {
      holidays: this.state.holidays,
      years: this.state.years,
      today: new Date(),
      timelineImage: require('../../../common/images/timeline-holidays/timeline_node.svg')
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }
}