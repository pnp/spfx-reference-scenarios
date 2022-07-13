import {
  BaseImageCardView,
  IImageCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction,
  ICardButton,
  BaseAdaptiveCardExtension
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'MyMailAdaptiveCardExtensionStrings';
import { Icons } from '../models/myMail.Images';
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
    let imageUrl: string = "";
    let focused: number = 0;
    this.state.messages.map((m) => {
      if (m.inferenceClassification == "focused") {
        focused++;
      }
    });
    let cardText: string = `${strings.CardViewIntro} ${emailCount}`;
    if (this.properties.mailType == MailType.all) {
      cardText += ` ${strings.UnreadMailText}\n\n${focused} ${strings.FocusedMailText}\n\n${(this.state.messages.length - focused).toString()} ${strings.OtherMailText}`;
    } else if (this.properties.mailType == MailType.focused) {
      cardText += ` ${strings.UnreadFocusedMessagesText}`;
    } else {
      cardText += ` ${strings.UnreadOtherMessagesText}`;
    }
    if (this.cardSize == "Large") {
      imageUrl = Icons.LargeImage.SVG;
    } else {
      imageUrl = Icons.MediumImage.SVG;
    }
    imageUrl = "data:image/svg+xml;base64," + btoa(imageUrl.replace("__XXX__", emailCount));
    return {
      primaryText: cardText,
      imageUrl: imageUrl,
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
