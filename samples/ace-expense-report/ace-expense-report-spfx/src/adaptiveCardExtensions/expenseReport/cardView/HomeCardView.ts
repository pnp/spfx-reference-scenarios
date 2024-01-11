import {
  BaseComponentsCardView,
  ComponentsCardViewParameters,
  ImageCardView,
  IExternalLinkCardAction,
  IQuickViewCardAction
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'ExpenseReportAdaptiveCardExtensionStrings';
import {
  IExpenseReportAdaptiveCardExtensionProps,
  IExpenseReportAdaptiveCardExtensionState,
  QUICK_VIEW_UPLOAD_REGISTRY_ID
} from '../ExpenseReportAdaptiveCardExtension';

export class HomeCardView extends BaseComponentsCardView<
  IExpenseReportAdaptiveCardExtensionProps,
  IExpenseReportAdaptiveCardExtensionState,
  ComponentsCardViewParameters
> {
  public get cardViewParameters(): ComponentsCardViewParameters {
    return ImageCardView({
      cardBar: {
        componentName: 'cardBar',
        title: this.properties.title
      },
      image: {
        url: require('../assets/PiledCoins.png'),
        altText: 'Placeholder image'
      },
      header: {
        componentName: 'text',
        text: strings.PrimaryText
      },
      footer: {
        componentName: 'cardButton',
        title: strings.NewExpense,
        action: {
          type: 'QuickView',
          parameters: {
            view: QUICK_VIEW_UPLOAD_REGISTRY_ID
          }
        }
      }
    });
  }

  public get onCardSelection(): IQuickViewCardAction | IExternalLinkCardAction | undefined {
    return {
      type: 'QuickView',
      parameters: {
        view: QUICK_VIEW_UPLOAD_REGISTRY_ID
      }
    };
  }
}
