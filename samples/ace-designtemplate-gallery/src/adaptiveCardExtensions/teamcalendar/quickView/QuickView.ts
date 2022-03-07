import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'TeamcalendarAdaptiveCardExtensionStrings';
import { Logger, LogLevel } from "@pnp/logging";
import { Appointment, Day } from '../../../common/models/designtemplate.models';
import { ITeamcalendarAdaptiveCardExtensionProps, ITeamcalendarAdaptiveCardExtensionState } from '../TeamcalendarAdaptiveCardExtension';
import { dtg } from '../../../common/services/designtemplate.service';
import { cloneDeep } from '@microsoft/sp-lodash-subset';
import { Monday } from 'TeamcalendarAdaptiveCardExtensionStrings';

export interface IQuickViewData {
  currentDate: Date;
  viewDate: Date;
  days: Day[];
  selectedSunday: Day;
  selectedAppointments: Appointment[];
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
      currentDate: new Date(),
      viewDate: this.state.viewDate,
      days: this.state.days,
      selectedSunday: this.state.selectedSunday,
      selectedAppointments: this.state.selectedAppointments,
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
          const prevMonth: Date = cloneDeep(this.state.viewDate);
          prevMonth.setMonth(prevMonth.getMonth() - 1);
          const days: Day[] = dtg.getCalendarDays(prevMonth);
          this.setState({ viewDate: prevMonth, days: days, selectedAppointments: [], selectedSunday: null });
        } else if (id === 'next') {
          const nextMonth: Date = cloneDeep(this.state.viewDate);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          const days: Day[] = dtg.getCalendarDays(nextMonth);
          this.setState({ viewDate: nextMonth, days: days, selectedAppointments: [], selectedSunday: null });
        } else if (id === 'selectDay') {
          const day: Day = action.data.day;
          let weekdayIndex: number = day.day - day.weekDayIndex;
          if (weekdayIndex < 0) {
            weekdayIndex = 0;
          }
          let selectedSunday: Day = new Day(day.monthIndex, 0, weekdayIndex);
          this.setState({ selectedAppointments: day.appointments, selectedSunday: selectedSunday });
        }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (onAction) - ${err}`, LogLevel.Error);
    }
  }
}