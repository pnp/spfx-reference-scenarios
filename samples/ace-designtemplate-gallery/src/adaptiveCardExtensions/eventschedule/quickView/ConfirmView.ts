import { ISPFxAdaptiveCard, BaseAdaptiveCardView, ISubmitActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'EventscheduleAdaptiveCardExtensionStrings';
import { IEventscheduleAdaptiveCardExtensionProps, IEventscheduleAdaptiveCardExtensionState } from '../EventscheduleAdaptiveCardExtension';

import { Event, EventRegistration } from '../../../common/models/designtemplate.models';
import { QUICK_VIEW_REGISTRY_ID } from '../../eventschedule/EventscheduleAdaptiveCardExtension';
import { dtg } from '../../../common/services/designtemplate.service';

export interface IConfirmViewData {
  event: Event;
  eventRegistration: EventRegistration;
  confirmLink: string;
  dividerline: string;
  strings: IEventscheduleAdaptiveCardExtensionStrings;
}

export class ConfirmView extends BaseAdaptiveCardView<
  IEventscheduleAdaptiveCardExtensionProps,
  IEventscheduleAdaptiveCardExtensionState,
  IConfirmViewData
> {
  private LOG_SOURCE = "🔶 Event Schedule Confirm View";

  public get data(): IConfirmViewData {
    return {
      event: this.state.eventsApp,
      eventRegistration: this.state.registrationData,
      confirmLink: dtg.GetEventRegistrationLink(this.state.registrationData),
      dividerline: require('../../../common/images/visual-list/line_pivot_dark.gif'),
      strings: strings
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/ConfirmViewTemplate.json');
  }

  public async onAction(action: ISubmitActionArguments): Promise<void> {
    try {
      if (action.type === 'Submit') {
        const { id } = action.data;
        if (id === 'cancel') {
          this.quickViewNavigator.push(QUICK_VIEW_REGISTRY_ID);
        }
      }
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (onAction) -- click event not handled. - ${err}`
      );
    }
  }
}