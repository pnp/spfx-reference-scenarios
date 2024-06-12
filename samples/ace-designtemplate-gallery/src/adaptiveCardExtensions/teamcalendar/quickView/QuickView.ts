import { ISPFxAdaptiveCard, BaseAdaptiveCardView, ISubmitActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'TeamcalendarAdaptiveCardExtensionStrings';
import { Appointment, Day } from '../../../common/models/designtemplate.models';
import { ITeamcalendarAdaptiveCardExtensionProps, ITeamcalendarAdaptiveCardExtensionState } from '../TeamcalendarAdaptiveCardExtension';
import { cloneDeep } from '@microsoft/sp-lodash-subset';
import { dtg } from '../../../common/services/designtemplate.service';

export interface IQuickViewData {
  currentDate: Date;
  currentMonth: string;
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
  private LOG_SOURCE = "🔶 Team Calendar Quick View";

  public get data(): IQuickViewData {

    return {
      currentDate: new Date(),
      currentMonth: Intl.DateTimeFormat(this.context.pageContext.cultureInfo.currentUICultureName, { weekday: undefined, year: 'numeric', month: 'short', day: undefined }).format(this.state.viewDate),
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

  public async onAction(action: ISubmitActionArguments): Promise<void> {
    try {
      if (action.type === 'Submit') {
        const { id } = action.data;
        if (id === 'prev') {
          const prevMonth: Date = cloneDeep(this.state.viewDate);
          prevMonth.setMonth(prevMonth.getMonth() - 1);
          const days: Day[] = dtg.getCalendarDays(prevMonth, this.context.pageContext.cultureInfo.currentUICultureName);
          this.setState({ viewDate: prevMonth, days: days, selectedAppointments: [], selectedSunday: null });
        } else if (id === 'next') {
          const nextMonth: Date = cloneDeep(this.state.viewDate);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          const days: Day[] = dtg.getCalendarDays(nextMonth, this.context.pageContext.cultureInfo.currentUICultureName);
          this.setState({ viewDate: nextMonth, days: days, selectedAppointments: [], selectedSunday: null });
        } else if (id === 'selectDay') {
          const day: Day = action.data.day;
          let weekdayIndex: number = day.day - day.weekDayIndex;
          if (weekdayIndex < 0) {
            weekdayIndex = 0;
          }
          const selectedSunday: Day = new Day(day.monthIndex, 0, weekdayIndex);
          this.setState({ selectedAppointments: day.appointments, selectedSunday: selectedSunday });
        }
      }
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (onAction) -- click event not handled. - ${err}`
      );
    }
  }
}