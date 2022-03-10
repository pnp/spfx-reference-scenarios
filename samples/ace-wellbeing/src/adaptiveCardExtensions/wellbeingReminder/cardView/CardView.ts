import {
  BaseBasicCardView,
  IBasicCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction,
  ICardButton
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'WellbeingReminderAdaptiveCardExtensionStrings';
import { IWellbeingReminderAdaptiveCardExtensionProps, IWellbeingReminderAdaptiveCardExtensionState, QUICK_VIEW_REGISTRY_ID } from '../WellbeingReminderAdaptiveCardExtension';

export class CardView extends BaseBasicCardView<IWellbeingReminderAdaptiveCardExtensionProps, IWellbeingReminderAdaptiveCardExtensionState> {
  public get cardButtons(): [ICardButton] | [ICardButton, ICardButton] | undefined {

    if (this.state.remainingWellbeingDays > 0) {
      return [
        {
          title: 'Schedule',
          action: {
            type: 'QuickView',
            parameters: {
              view: QUICK_VIEW_REGISTRY_ID
            }
          },
          style: 'positive'
        }
      ];
    }
  }

  public get data(): IBasicCardParameters {

    if (this.state.remainingWellbeingDays === null) {
      return {
        primaryText: "Loading..."
      };
    }

    if (this.state.remainingWellbeingDays === 0) {
      return {
        primaryText: `You have no more wellbeing days pending to schedule`
      };
    }

    let daySuffix : string = this.state.remainingWellbeingDays > 1 ? 's' : '';

    return {
      primaryText: `You have ${this.state.remainingWellbeingDays} more wellbeing day${daySuffix}. Schedule one to recharge`
    };
  }

  public get onCardSelection(): IQuickViewCardAction | IExternalLinkCardAction | undefined {
    return {
      type: 'ExternalLink',
      parameters: {
        target: 'https://www.bing.com'
      }
    };
  }
}
