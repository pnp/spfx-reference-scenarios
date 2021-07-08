import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'RoomReservationAdaptiveCardExtensionStrings';
import { IMeeting } from '../../../webparts/roomReservation/models/rr.models';
import { rr } from '../../../webparts/roomReservation/services/rr.service';
import { IRoomReservationAdaptiveCardExtensionProps, IRoomReservationAdaptiveCardExtensionState } from '../RoomReservationAdaptiveCardExtension';

export interface IQuickViewData {
  subTitle: string;
  title: string;
  meeting: IMeeting;
}

export class QuickView extends BaseAdaptiveCardView<
  IRoomReservationAdaptiveCardExtensionProps,
  IRoomReservationAdaptiveCardExtensionState,
  IQuickViewData
> {
  public get data(): IQuickViewData {
    return {
      subTitle: strings.SubTitle,
      title: strings.Title,
      meeting: rr.Config.meetings[this.state.currentMeeting]
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }

  public async onAction(action: IActionArguments): Promise<void> {
    if (action.type === 'Submit') {
      const { id, newIndex } = action.data;
      if (id === 'previous') {
        let newMeetingId: number = this.state.currentMeeting;
        newMeetingId = (newMeetingId = 0) ? (rr.Config.meetings.length - 1) : newMeetingId--;
        this.setState({ currentMeeting: newMeetingId });
      } else if (id === 'next') {
        let newMeetingId: number = this.state.currentMeeting;
        newMeetingId = (newMeetingId < rr.Config.meetings.length) ? newMeetingId++ : 0;
        this.setState({ currentMeeting: newMeetingId });
      }
    }
  }
}