import {
  ComponentsCardViewParameters,
  ITextCardViewParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction,
  PrimaryTextCardView,
  BaseComponentsCardView
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'ListOrdersAdaptiveCardExtensionStrings';
import { IListOrdersAdaptiveCardExtensionProps, IListOrdersAdaptiveCardExtensionState, LISTORDERS_QUICK_VIEW_REGISTRY_ID } from '../ListOrdersAdaptiveCardExtension';

export class CardView extends BaseComponentsCardView<
  IListOrdersAdaptiveCardExtensionProps, 
  IListOrdersAdaptiveCardExtensionState, 
  ComponentsCardViewParameters
> {

  public get cardViewParameters(): ITextCardViewParameters  {
    return PrimaryTextCardView({
      cardBar: {
        componentName: 'cardBar',
        title: this.properties.title
      },
      header: {
        componentName: 'text',
        text: strings.PrimaryText
      },
      body: {
        componentName: 'text',
        text: this.state.description
      },
      footer: {
          componentName: 'cardButton',
          title: strings.QuickViewButton,
          action: {
            type: 'QuickView',
            parameters: {
              view: LISTORDERS_QUICK_VIEW_REGISTRY_ID
            }
          }
        }
      }
    );
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
