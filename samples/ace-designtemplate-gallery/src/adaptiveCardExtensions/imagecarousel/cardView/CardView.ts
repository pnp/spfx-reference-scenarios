import {
  BasePrimaryTextCardView,
  IPrimaryTextCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction,
  ICardButton
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'ImagecarouselAdaptiveCardExtensionStrings';
import { IImagecarouselAdaptiveCardExtensionProps, IImagecarouselAdaptiveCardExtensionState, QUICK_VIEW_REGISTRY_ID } from '../ImagecarouselAdaptiveCardExtension';

export class CardView extends BasePrimaryTextCardView<IImagecarouselAdaptiveCardExtensionProps, IImagecarouselAdaptiveCardExtensionState> {

  public get data(): IPrimaryTextCardParameters {
    return {
      primaryText: this.properties.cardHeading,
      description: this.properties.description
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
