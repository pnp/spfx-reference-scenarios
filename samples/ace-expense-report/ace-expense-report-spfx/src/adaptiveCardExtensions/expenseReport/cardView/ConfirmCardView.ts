import {
  BaseComponentsCardView,
  ComponentsCardViewParameters,
  ImageCardView,
  IActionArguments
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'ExpenseReportAdaptiveCardExtensionStrings';
import {
  IExpenseReportAdaptiveCardExtensionProps,
  IExpenseReportAdaptiveCardExtensionState,
  CARD_VIEW_HOME_REGISTRY_ID
} from '../ExpenseReportAdaptiveCardExtension';

export class ConfirmCardView extends BaseComponentsCardView<
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
        url: require('../assets/Ok-Feedback.png'),
        altText: 'Placeholder image'
      },
      header: {
        componentName: 'text',
        text: strings.ConfirmationText
      },
      footer: {
        componentName: 'cardButton',
        id: 'restart',
        title: strings.GoHome,
        action: {
          type: 'Submit',
          parameters: {}
        }
      }
    });
  }

  public onAction(action: IActionArguments | any): void {

    if (action.id === "restart") {
      this.cardNavigator.replace(CARD_VIEW_HOME_REGISTRY_ID);
    }
  }
}
