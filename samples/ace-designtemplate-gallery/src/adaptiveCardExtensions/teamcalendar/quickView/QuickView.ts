import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'TeamcalendarAdaptiveCardExtensionStrings';
import { Logger, LogLevel } from "@pnp/logging";
import { Day } from '../../../common/models/designtemplate.models';
import { ITeamcalendarAdaptiveCardExtensionProps, ITeamcalendarAdaptiveCardExtensionState } from '../TeamcalendarAdaptiveCardExtension';
import { dtg } from '../../../common/services/designtemplate.service';
import { cloneDeep } from '@microsoft/sp-lodash-subset';

export interface IQuickViewData {
  currentDate: Date;
  days: Day[];
  strings: ITeamcalendarAdaptiveCardExtensionStrings;
}

export class QuickView extends BaseAdaptiveCardView<
  ITeamcalendarAdaptiveCardExtensionProps,
  ITeamcalendarAdaptiveCardExtensionState,
  IQuickViewData
> {
  private LOG_SOURCE: string = "🔶 Team Calendar Quick View";

  public get data(): IQuickViewData {

    return {
      currentDate: this.state.currentDate,
      days: this.state.days,
      strings: strings
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }

  public async onAction(action: IActionArguments): Promise<void> {
    try {
      if (action.type === 'Submit') {
        const { id } = action.data;
        if (id === 'prev') {
          const prevMonth: Date = cloneDeep(this.state.currentDate);
          prevMonth.setMonth(prevMonth.getMonth() - 1);
          const days: Day[] = dtg.getCalendarDays(prevMonth);
          this.setState({ currentDate: prevMonth, days: days });
        } else if (id === 'next') {
          const nextMonth: Date = cloneDeep(this.state.currentDate);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          const days: Day[] = dtg.getCalendarDays(nextMonth);
          this.setState({ currentDate: nextMonth, days: days });
        }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (onAction) - ${err}`, LogLevel.Error);
    }
  }
}