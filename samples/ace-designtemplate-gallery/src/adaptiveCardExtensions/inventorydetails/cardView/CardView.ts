import {
  BasePrimaryTextCardView,
  IPrimaryTextCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction,
  ICardButton
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'InventorydetailsAdaptiveCardExtensionStrings';
import { IInventorydetailsAdaptiveCardExtensionProps, IInventorydetailsAdaptiveCardExtensionState, QUICK_VIEW_REGISTRY_ID } from '../InventorydetailsAdaptiveCardExtension';

export class CardView extends BasePrimaryTextCardView<IInventorydetailsAdaptiveCardExtensionProps, IInventorydetailsAdaptiveCardExtensionState> {

  public get data(): IPrimaryTextCardParameters {
    return {
      primaryText: `${(this.state.app.readyToShipChange > 0) ? "+" : "-"}${this.state.app.readyToShipChange}%`,
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
