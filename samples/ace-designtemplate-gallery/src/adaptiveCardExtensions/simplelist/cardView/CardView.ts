import {
  BaseImageCardView,
  IImageCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'SimplelistAdaptiveCardExtensionStrings';
import { ISimplelistAdaptiveCardExtensionProps, ISimplelistAdaptiveCardExtensionState, QUICK_VIEW_REGISTRY_ID } from '../SimplelistAdaptiveCardExtension';

export class CardView extends BaseImageCardView<ISimplelistAdaptiveCardExtensionProps, ISimplelistAdaptiveCardExtensionState> {
  public get data(): IImageCardParameters {
    let text: string = strings.CardTextShort;
    if (this.cardSize == "Large") {
      text = strings.CardText;
    }
    return {
      primaryText: text,
      imageUrl: require('../../../common/images/simple-list/office-table.jpg')
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

