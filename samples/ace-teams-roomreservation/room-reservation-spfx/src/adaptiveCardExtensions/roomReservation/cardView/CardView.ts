import {
  BaseImageCardView,
  IImageCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction,
  ICardButton
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'RoomReservationAdaptiveCardExtensionStrings';
import { IRoomReservationAdaptiveCardExtensionProps, IRoomReservationAdaptiveCardExtensionState, QUICK_VIEW_REGISTRY_ID } from '../RoomReservationAdaptiveCardExtension';
import { iconColor } from '../../../webparts/roomReservation/models/rr.Icons';

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
    const meeting = this.state.meetings[this.state.currentMeetingIndex];
    const imageSrc: any = require(`../../../webparts/roomReservation/components/assets/card-${meeting.roomId}.jpg`);
    return {
      title: strings.Title,
      iconProperty: iconColor,
      primaryText: `${meeting.subject} -  ${meeting.displayTime}`,
      imageUrl: imageSrc
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
