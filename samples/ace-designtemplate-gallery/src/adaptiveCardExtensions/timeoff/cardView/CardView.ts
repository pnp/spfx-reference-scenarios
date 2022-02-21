import {
  BasePrimaryTextCardView,
  IPrimaryTextCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction,
  ICardButton
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'TimeoffAdaptiveCardExtensionStrings';
import { ITimeoffAdaptiveCardExtensionProps, ITimeoffAdaptiveCardExtensionState, QUICK_VIEW_REGISTRY_ID } from '../TimeoffAdaptiveCardExtension';

export class CardView extends BasePrimaryTextCardView<ITimeoffAdaptiveCardExtensionProps, ITimeoffAdaptiveCardExtensionState> {
  public get cardButtons(): [ICardButton] | [ICardButton, ICardButton] | undefined {
    return [
      {
        title: strings.QuickViewButtonText,
        action: {
          type: 'QuickView',
          parameters: {
            view: QUICK_VIEW_REGISTRY_ID
          }
        }
      }
    ];
  }

  public get data(): IPrimaryTextCardParameters {
    return {
      primaryText: `${this.state.timeoff.pto} ${strings.DaysLabel}`,
      description: `${strings.CardViewText}`
    };
  }

  public get onCardSelection(): IQuickViewCardAction | IExternalLinkCardAction | undefined {
    return {
      type: 'QuickView',
      parameters: {
        view: QUICK_VIEW_REGISTRY_ID
      }
    };
  }
}
