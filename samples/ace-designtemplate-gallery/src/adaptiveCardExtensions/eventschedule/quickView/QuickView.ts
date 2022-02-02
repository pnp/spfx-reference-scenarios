import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'EventscheduleAdaptiveCardExtensionStrings';
import { CONFIRM_VIEW_REGISTRY_ID, IEventscheduleAdaptiveCardExtensionProps, IEventscheduleAdaptiveCardExtensionState } from '../EventscheduleAdaptiveCardExtension';
import { Event, EventRegistration } from '../../../common/models/designtemplate.models';
import { Logger, LogLevel } from "@pnp/logging";
import { dtg } from '../../../common/services/designtemplate.service';

export interface IQuickViewData {
  event: Event;
  eventRegistration: EventRegistration;
  selectedDay: number;
  dividerline: string;
  showRegister: boolean;
}

export class QuickView extends BaseAdaptiveCardView<
  IEventscheduleAdaptiveCardExtensionProps,
  IEventscheduleAdaptiveCardExtensionState,
  IQuickViewData
> {
  private LOG_SOURCE: string = "🔶 Event Schedule Quick View";

  public get data(): IQuickViewData {
    const divider: string = require('../../../common/images/event-schedule/line_pivot_dark.svg');

    return {
      event: this.state.eventsApp.cardData,
      eventRegistration: this.state.registrationData,
      selectedDay: this.state.selectedDay,
      dividerline: divider,
      showRegister: this.state.showRegister
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }

  public async onAction(action: IActionArguments): Promise<void> {
    try {
      if (action.type === 'Submit') {
        const { id, dayID } = action.data;
        if (id === 'toggle') {
          this.setState({ selectedDay: dayID });
        } else if (id === 'register') {
          this.setState({ showRegister: !this.state.showRegister });
          this.quickViewNavigator.pop(true);
        }
        else if (id === 'confirm') {
          const registration: EventRegistration = new EventRegistration(this.state.eventsApp.cardData.eventTitle, action.data?.first_name, action.data?.last_name, action.data?.company_name, action.data?.phone, action.data?.accept_policy);
          this.setState({ registrationData: registration });
          this.quickViewNavigator.push(CONFIRM_VIEW_REGISTRY_ID, false);
        }
        else if (id === 'cancel') {
          this.setState({ showRegister: false });
          this.quickViewNavigator.pop(true);
        }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (onAction) - ${err}`, LogLevel.Error);
    }
  }
}