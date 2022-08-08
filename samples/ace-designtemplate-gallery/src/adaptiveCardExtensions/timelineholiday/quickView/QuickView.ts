import { ISPFxAdaptiveCard, BaseAdaptiveCardView } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'TimelineholidayAdaptiveCardExtensionStrings';
import { Holiday } from '../../../common/models/designtemplate.models';
import { ITimelineholidayAdaptiveCardExtensionProps, ITimelineholidayAdaptiveCardExtensionState } from '../TimelineholidayAdaptiveCardExtension';

export interface IQuickViewData {
  holidays: Holiday[];
  years: string[];
  holidayCount: number[];
  today: string;
  timelineImage: string;
  timeoffIcon: string;
  strings: ITimelineholidayAdaptiveCardExtensionStrings;
}

export class QuickView extends BaseAdaptiveCardView<
  ITimelineholidayAdaptiveCardExtensionProps,
  ITimelineholidayAdaptiveCardExtensionState,
  IQuickViewData
> {
  public get data(): IQuickViewData {
    const holidayCount: number[] = [];
    this.state.years.map((year) => {
      let holidays = 0;
      this.state.holidays.map((holiday) => {
        const date: Date = new Date(holiday.date);
        if (date.getFullYear().toString() == year) {
          holidays = holidays + 1;
        }
      });
      holidayCount.push(holidays);
    });


    return {
      holidays: this.state.holidays,
      years: this.state.years,
      holidayCount: holidayCount,
      today: new Date().getFullYear().toString(),
      timelineImage: require('../../../common/images/timeline-holidays/timeline_node.svg'),
      timeoffIcon: require('../../../common/images/timeline-holidays/icn_beach.svg'),
      strings: strings
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }
}