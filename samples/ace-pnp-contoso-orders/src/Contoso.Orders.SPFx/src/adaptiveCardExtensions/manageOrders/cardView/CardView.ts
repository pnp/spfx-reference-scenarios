import {
  BaseComponentsCardView,
  ComponentsCardViewParameters,
  PrimaryTextCardView,
  ITextCardViewParameters,
  IQuickViewCardAction,
  IExternalLinkCardAction
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'ManageOrdersAdaptiveCardExtensionStrings';
import { 
  IManageOrdersAdaptiveCardExtensionProps, 
  IManageOrdersAdaptiveCardExtensionState, 
  ADDORDER_QUICK_VIEW_REGISTRY_ID,
  LISTORDERS_QUICK_VIEW_REGISTRY_ID
} from '../ManageOrdersAdaptiveCardExtension';

export class CardView extends BaseComponentsCardView<
  IManageOrdersAdaptiveCardExtensionProps, 
  IManageOrdersAdaptiveCardExtensionState, 
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
      footer: [
          {
            componentName: 'cardButton',
            title: strings.ListOrdersQuickViewButton,
            action: {
              type: 'QuickView',
              parameters: {
                view: LISTORDERS_QUICK_VIEW_REGISTRY_ID
              }
            }
          },
          {
            componentName: 'cardButton',
            title: strings.AddOrderQuickViewButton,
            action: {
              type: 'QuickView',
              parameters: {
                view: ADDORDER_QUICK_VIEW_REGISTRY_ID
              }
            }
          }
        ]
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
