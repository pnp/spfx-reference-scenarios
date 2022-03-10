import {
  BaseBasicCardView,
  IBasicCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction,
  ICardButton
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'WellbeingRequestsAdaptiveCardExtensionStrings';
import { IWellbeingRequestsAdaptiveCardExtensionProps, IWellbeingRequestsAdaptiveCardExtensionState, QUICK_VIEW_REGISTRY_ID } from '../WellbeingRequestsAdaptiveCardExtension';

export class CardView extends BaseBasicCardView<IWellbeingRequestsAdaptiveCardExtensionProps, IWellbeingRequestsAdaptiveCardExtensionState> {
  public get cardButtons(): [ICardButton] | [ICardButton, ICardButton] | undefined {
    if (this.state.requests.length < 1) {
      return;
    }

    return [
      {
        title: 'View',
        action: {
          type: 'QuickView',
          parameters: {
            view: QUICK_VIEW_REGISTRY_ID
          }
        }
      }
    ];
  }

  public get data(): IBasicCardParameters {
    return {
      primaryText: this.state.requests.length < 1 ? `There are no pending wellbeing requests` : `You have ${this.state.requests.length} pending wellbeing requests`
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
