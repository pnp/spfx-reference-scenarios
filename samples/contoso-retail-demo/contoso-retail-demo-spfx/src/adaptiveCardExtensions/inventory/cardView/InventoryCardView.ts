import {
  BaseComponentsCardView,
  ComponentsCardViewParameters,
  ImageCardView,
  IExternalLinkCardAction,
  IQuickViewCardAction,
  CardViewActionsFooterConfiguration,
  ITextCardViewParameters
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'InventoryAdaptiveCardExtensionStrings';

import { IInventoryAdaptiveCardExtensionProps } from '../IInventoryAdaptiveCardExtensionProps';
import { IInventoryAdaptiveCardExtensionState } from '../IInventoryAdaptiveCardExtensionState';
import { QUICK_VIEW_INVENTORY_LIST_REGISTRY_ID } from '../InventoryAdaptiveCardExtension';

export class InventoryCardView extends BaseComponentsCardView<
  IInventoryAdaptiveCardExtensionProps, 
  IInventoryAdaptiveCardExtensionState,
  ComponentsCardViewParameters
> {
  public get cardViewParameters(): ITextCardViewParameters {

    const footer: CardViewActionsFooterConfiguration = this.state.products.length > 0 ? 
    {
      componentName: 'cardButton',
      title: strings.Generic.InventoryListQuickViewButton,
      action: {
        type: 'QuickView',
        parameters: {
          view: QUICK_VIEW_INVENTORY_LIST_REGISTRY_ID
        }
      }
    } : undefined;
    
    return ImageCardView({
      cardBar: {
        componentName: 'cardBar',
        title: strings.Generic.InventoryCardViewTitle
      },
      image: {
        url: this.state.currentProduct?.picture ?? require('../../../assets/loading-square.gif')
      },
      header: {
        componentName: 'text',
        text: this.state.currentProduct ? `'${this.state.currentProduct?.description}' reference price is ${this.state.currentProduct?.price}$ and sales so far are ${this.state.currentProduct?.sales.toLocaleString('en-US')} items` : strings.Generic.Loading
      },
      footer: footer
    });
  }
  
  public get onCardSelection(): IQuickViewCardAction | IExternalLinkCardAction | undefined {
    return {
      type: 'ExternalLink',
      parameters: {
        target: 'https://pnp.github.io/'
      }
    };
  }
}
