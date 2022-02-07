import {
  BaseImageCardView,
  IImageCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction,
  ICardButton
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'Dynamicard3AdaptiveCardExtensionStrings';
import { IDynamicard3AdaptiveCardExtensionProps, IDynamicard3AdaptiveCardExtensionState, QUICK_VIEW_REGISTRY_ID } from '../Dynamicard3AdaptiveCardExtension';

export class CardView extends BaseImageCardView<IDynamicard3AdaptiveCardExtensionProps, IDynamicard3AdaptiveCardExtensionState> {
  /**
   * Buttons will not be visible if card size is 'Medium' with Image Card View.
   * It will support up to two buttons for 'Large' card size.
   */
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

  public get data(): IImageCardParameters {

    const { description, image } = this.state;

    return {
      primaryText: description,
      imageUrl: image,
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
