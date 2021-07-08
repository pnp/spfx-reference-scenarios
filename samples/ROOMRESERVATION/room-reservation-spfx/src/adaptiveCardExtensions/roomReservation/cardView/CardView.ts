import {
  BaseImageCardView,
  IImageCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction,
  ICardButton
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'RoomReservationAdaptiveCardExtensionStrings';
import { IRoomReservationAdaptiveCardExtensionProps, IRoomReservationAdaptiveCardExtensionState, QUICK_VIEW_REGISTRY_ID } from '../RoomReservationAdaptiveCardExtension';

export class CardView extends BaseImageCardView<IRoomReservationAdaptiveCardExtensionProps, IRoomReservationAdaptiveCardExtensionState> {
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
    return {
      primaryText: strings.PrimaryText,
      imageUrl: 'https://blogs.microsoft.com/uploads/2017/09/WR-Microsoft-logo.jpg'
    };
  }

  public get onCardSelection(): IQuickViewCardAction | IExternalLinkCardAction | undefined {
    return {
      type: 'ExternalLink',
      parameters: {
        target: this.state.teamsUrl
      }
    };
  }
}
