import {
  BasePrimaryTextCardView,
  IPrimaryTextCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction,
  ICardButton
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'VisuallistAdaptiveCardExtensionStrings';
import { IVisuallistAdaptiveCardExtensionProps, IVisuallistAdaptiveCardExtensionState, QUICK_VIEW_REGISTRY_ID } from '../VisuallistAdaptiveCardExtension';

export class CardView extends BasePrimaryTextCardView<IVisuallistAdaptiveCardExtensionProps, IVisuallistAdaptiveCardExtensionState> {
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
      primaryText: strings.CardViewTitle,
      description: strings.CardViewText
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
