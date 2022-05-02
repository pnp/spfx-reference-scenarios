import {
  BaseImageCardView,
  IImageCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction,
  ICardButton
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'EventscheduleAdaptiveCardExtensionStrings';
import {
  IEventscheduleAdaptiveCardExtensionProps,
  IEventscheduleAdaptiveCardExtensionState,
  QUICK_VIEW_REGISTRY_ID
} from '../EventscheduleAdaptiveCardExtension';

export class CardView extends BaseImageCardView<IEventscheduleAdaptiveCardExtensionProps, IEventscheduleAdaptiveCardExtensionState> {
  /**
   * Buttons will not be visible if card size is 'Medium' with Image Card View.
   * It will support up to two buttons for 'Large' card size.
   */
  public get cardButtons(): [ICardButton] | [ICardButton, ICardButton] | undefined {
    return [
      {
        title: strings.QuickViewButton,
        action: {
          type: 'QuickView',
          parameters: {
            view: QUICK_VIEW_REGISTRY_ID
          }
        }
      }
    ];
  }

  public get data(): IImageCardParameters {
    let text: string = strings.PrimaryTextShort;
    if (this.cardSize == "Large") {
      text = `${strings.PrimaryText} ${new Date().getFullYear()} `;
    }
    return {
      primaryText: text,
      imageUrl: this.state.eventsApp.cardViewImage,
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
