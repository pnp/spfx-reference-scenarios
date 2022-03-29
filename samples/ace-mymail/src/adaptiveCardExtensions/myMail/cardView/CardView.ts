import {
  BaseImageCardView,
  IImageCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction,
  ICardButton
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'MyMailAdaptiveCardExtensionStrings';
import { MailTypeFocused } from 'MyMailAdaptiveCardExtensionStrings';
import { MailType } from '../models/mymail.models';
import { IMyMailAdaptiveCardExtensionProps, IMyMailAdaptiveCardExtensionState, QUICK_VIEW_REGISTRY_ID } from '../MyMailAdaptiveCardExtension';

export class CardView extends BaseImageCardView<IMyMailAdaptiveCardExtensionProps, IMyMailAdaptiveCardExtensionState> {
  /**
   * Buttons will not be visible if card size is 'Medium' with Image Card View.
   * It will support up to two buttons for 'Large' card size.
   */
  public get cardButtons(): [ICardButton] | [ICardButton, ICardButton] | undefined {
    if (this.cardSize == "Medium") { return; }
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
    const emailCount: string = this.state.messages.length.toString();
    let cardText: string = `${strings.CardViewIntro}\n\n${emailCount} ${strings.UnreadMailText}`;
    if (this.properties.mailType == MailType.all) {
      cardText += `\n\n${this.state.focusedMessages} ${strings.FocusedMailText}\n\n${this.state.otherMessages} ${strings.OtherMailText}`;
    }
    return {
      primaryText: cardText,
      imageUrl: require('../assets/MicrosoftLogo.png'),
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
