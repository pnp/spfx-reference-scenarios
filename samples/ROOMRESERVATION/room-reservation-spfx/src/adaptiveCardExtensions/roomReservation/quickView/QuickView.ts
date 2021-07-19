import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'RoomReservationAdaptiveCardExtensionStrings';
import { IMeetingResult } from '../../../webparts/roomReservation/models/rr.models';
import { IRoomReservationAdaptiveCardExtensionProps, IRoomReservationAdaptiveCardExtensionState } from '../RoomReservationAdaptiveCardExtension';
import { Logger, LogLevel } from "@pnp/logging";

export interface IQuickViewData {
  subTitle: string;
  title: string;
  meeting: IMeetingResult;
  imageUrl: string;
  teamsUrl: string;
  covidAppUrl: string;
  planTripButtonLabel: string;
  covidFormButtonLabel: string;
  meetingDetailsButtonLabel: string;
}

export class QuickView extends BaseAdaptiveCardView<
  IRoomReservationAdaptiveCardExtensionProps,
  IRoomReservationAdaptiveCardExtensionState,
  IQuickViewData
> {
  private LOG_SOURCE: string = "🔶 QuickView";

  public get data(): IQuickViewData {
    let retVal: IQuickViewData = null;
    try {
      const meeting = this.state.meetings[this.state.currentMeetingIndex];
      if (meeting) {
        let imageUrl: string = "";
        if (meeting.roomId > -1) {
          imageUrl = require(`../../../webparts/roomReservation/components/assets/card-${meeting.roomId}.jpg`);
        }
        retVal = {
          title: strings.Title,
          subTitle: strings.SubTitle,
          meeting: meeting,
          imageUrl: imageUrl,
          teamsUrl: this.state.teamsUrl,
          covidAppUrl: this.state.covidAppUrl,
          planTripButtonLabel: strings.PlanTripButton,
          covidFormButtonLabel: strings.CovidFormButton,
          meetingDetailsButtonLabel: strings.MeetingDetailsButton
        };
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (data) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }

  public async onAction(action: IActionArguments): Promise<void> {
    if (action.type === 'Submit') {
      const { id, newIndex } = action.data;
      if (id === 'previous') {
        let newMeetingIndex: number = this.state.currentMeetingIndex;
        newMeetingIndex = (newMeetingIndex = 0) ? (this.state.meetings.length - 1) : newMeetingIndex--;
        this.setState({ currentMeetingIndex: newMeetingIndex });
      } else if (id === 'next') {
        let newMeetingIndex: number = this.state.currentMeetingIndex;
        newMeetingIndex = (newMeetingIndex < this.state.meetings.length) ? newMeetingIndex + 1 : 0;
        this.setState({ currentMeetingIndex: newMeetingIndex });
      }
    }
  }
}