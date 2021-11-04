import {
  BasePrimaryTextCardView,
  IPrimaryTextCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction,
  ICardButton
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'ListOrdersAdaptiveCardExtensionStrings';
import { IListOrdersAdaptiveCardExtensionProps, IListOrdersAdaptiveCardExtensionState, LISTORDERS_QUICK_VIEW_REGISTRY_ID } from '../ListOrdersAdaptiveCardExtension';

export class CardView extends BasePrimaryTextCardView<IListOrdersAdaptiveCardExtensionProps, IListOrdersAdaptiveCardExtensionState> {
  public get cardButtons(): [ICardButton] | [ICardButton, ICardButton] | undefined {
    if (this.state.orders != null && this.state.orders.length > 0) {
      return [
        {
          title: strings.QuickViewButton,
          action: {
            type: 'QuickView',
            parameters: {
              view: LISTORDERS_QUICK_VIEW_REGISTRY_ID
            }
          }
        }
      ];
    } else {
      return undefined;
    }
  }

  public get data(): IPrimaryTextCardParameters {
    return {
      primaryText: strings.PrimaryText,
      description: this.state.description
    };
  }

  public get onCardSelection(): IQuickViewCardAction | IExternalLinkCardAction | undefined {
    return {
      type: 'ExternalLink',
      parameters: {
        target: 'https://aka.ms/m365pnp'
      }
    };
  }
}
