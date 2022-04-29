import {
  BaseImageCardView,
  IImageCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction,
  ICardButton
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'HelpdeskcreateticketAdaptiveCardExtensionStrings';
import { IHelpdeskcreateticketAdaptiveCardExtensionProps, IHelpdeskcreateticketAdaptiveCardExtensionState, QUICK_VIEW_REGISTRY_ID } from '../HelpdeskcreateticketAdaptiveCardExtension';

export class CardView extends BaseImageCardView<IHelpdeskcreateticketAdaptiveCardExtensionProps, IHelpdeskcreateticketAdaptiveCardExtensionState> {
  public get data(): IImageCardParameters {
    return {
      primaryText: strings.CardViewText,
      imageUrl: require('../assets/helpdesk.png'),
      title: this.properties.title
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
