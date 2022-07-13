import {
  BasePrimaryTextCardView,
  IPrimaryTextCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction,
  ICardButton
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'HelpdeskAdaptiveCardExtensionStrings';
import { IHelpdeskAdaptiveCardExtensionProps, IHelpdeskAdaptiveCardExtensionState, QUICK_VIEW_REGISTRY_ID } from '../HelpdeskAdaptiveCardExtension';

export class CardView extends BasePrimaryTextCardView<IHelpdeskAdaptiveCardExtensionProps, IHelpdeskAdaptiveCardExtensionState> {
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
    let primaryText: string = strings.CardViewNoTasks;
    if (this.state.tickets.length > 1) {
      primaryText = `${this.state.tickets.length.toString()} ${strings.CardViewTextPlural}`;
    } else {
      primaryText = `${this.state.tickets.length.toString()} ${strings.CardViewTextSingular}`;
    }
    return {
      primaryText: primaryText,
      description: strings.CardViewDescription,
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
