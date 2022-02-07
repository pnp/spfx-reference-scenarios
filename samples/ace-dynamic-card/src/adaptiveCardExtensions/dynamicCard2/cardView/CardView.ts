import {
  BasePrimaryTextCardView,
  IPrimaryTextCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction,
  ICardButton
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'DynamicCard2AdaptiveCardExtensionStrings';
import { IDynamicCard2AdaptiveCardExtensionProps, IDynamicCard2AdaptiveCardExtensionState, QUICK_VIEW_REGISTRY_ID } from '../DynamicCard2AdaptiveCardExtension';

export class CardView extends BasePrimaryTextCardView<IDynamicCard2AdaptiveCardExtensionProps, IDynamicCard2AdaptiveCardExtensionState> {
  public get cardButtons(): [ICardButton] | [ICardButton, ICardButton] | undefined {
    return [
      {
        title: strings.QuickViewButton,
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

    const { itemCount } = this.state;

    return {
      primaryText: `You've got ${itemCount} unread messages.`,
      description: this.properties.description
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
