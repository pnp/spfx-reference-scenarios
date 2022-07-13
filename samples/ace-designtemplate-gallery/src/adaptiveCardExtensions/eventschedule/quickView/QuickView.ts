import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments, ISubmitActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import { CONFIRM_VIEW_REGISTRY_ID, IEventscheduleAdaptiveCardExtensionProps, IEventscheduleAdaptiveCardExtensionState } from '../EventscheduleAdaptiveCardExtension';
import { Event, EventRegistration } from '../../../common/models/designtemplate.models';
import { Logger, LogLevel } from "@pnp/logging";
import * as strings from 'EventscheduleAdaptiveCardExtensionStrings';


export interface IQuickViewData {
  event: Event;
  eventRegistration: EventRegistration;
  selectedDay: number;
  dividerline: string;
  showRegister: boolean;
  strings: IEventscheduleAdaptiveCardExtensionStrings;
}

export class QuickView extends BaseAdaptiveCardView<
  IEventscheduleAdaptiveCardExtensionProps,
  IEventscheduleAdaptiveCardExtensionState,
  IQuickViewData
> {
  private LOG_SOURCE: string = "🔶 Event Schedule Quick View";

  public get data(): IQuickViewData {
    return {
      event: this.state.eventsApp,
      eventRegistration: this.state.registrationData,
      selectedDay: this.state.selectedDay,
      dividerline: require('../../../common/images/visual-list/line_pivot_dark.gif'),
      showRegister: this.state.showRegister,
      strings: strings
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }

  public async onAction(action: ISubmitActionArguments): Promise<void> {
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
          const registration: EventRegistration = new EventRegistration(this.state.eventsApp.eventTitle, action.data?.first_name, action.data?.last_name, action.data?.company_name, action.data?.phone, action.data?.accept_policy);
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