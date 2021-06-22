import * as React from 'react';
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import { cloneDeep } from 'lodash';
import find from 'lodash/find';
import { DateTime } from "luxon";

import styles from './RoomReservation.module.scss';
import strings from "RoomReservationWebPartStrings";
import { rr } from '../services/rr.service';
import Meetings from './molecules/Meetings';
import { IMeetingResult, IRoomResults, MeetingResult, RoomResult } from '../models/rr.models';
import MeetingStage from './organisms/MeetingStage';

export interface IRoomReservationProps { }

export interface IRoomReservationState {
  rooms: IRoomResults[];
  meetings: IMeetingResult[];
  selectedMeeting: IMeetingResult;
  selectedRoom: IRoomResults;
  scheduled: boolean;
}

export class RoomReservationState implements IRoomReservationState {
  constructor(
    public rooms: IRoomResults[] = [],
    public meetings: IMeetingResult[] = [],
    public selectedMeeting: IMeetingResult = null,
    public selectedRoom: IRoomResults = new RoomResult(),
    public scheduled: boolean = false
  ) { }
}
export default class RoomReservation extends React.Component<IRoomReservationProps, IRoomReservationState> {
  private LOG_SOURCE: string = "🔶 RoomReservation";

  constructor(props: IRoomReservationProps) {
    super(props);
    const rooms: IRoomResults[] = rr.GetAllRooms();
    const meetings: IMeetingResult[] = rr.GetMeetings();
    this.state = new RoomReservationState(rooms, meetings);
  }

  public shouldComponentUpdate(nextProps: Readonly<IRoomReservationProps>, nextState: Readonly<IRoomReservationState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _setSelectedMeeting = (meeting: IMeetingResult) => {
    try {
      if (meeting.roomId == -1) {
        const rooms: IRoomResults[] = rr.GetAvailableRooms(meeting.startTime, meeting.endTime, meeting.attendees);
        const blankSelectedRoom: IRoomResults = new RoomResult();
        this.setState({ selectedMeeting: meeting, rooms: rooms, selectedRoom: blankSelectedRoom, scheduled: false });
      } else {
        const room = find(this.state.rooms, { roomId: meeting.roomId, displayName: meeting.roomName });
        this.setState({ selectedMeeting: meeting, selectedRoom: room, scheduled: true });
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_setSelectedMeeting) - ${err}`, LogLevel.Error);
      return null;
    }
  }
  private _setRoom = (room: IRoomResults) => {
    try {
      this.setState({ selectedRoom: room });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_setMeeting) - ${err}`, LogLevel.Error);
      return null;
    }
  }

  private _getAvailableRooms = (start: DateTime, end: DateTime, participants: number) => {
    try {
      const rooms: IRoomResults[] = rr.GetAvailableRooms(start, end, participants);
      const selectedRoom: IRoomResults = new RoomResult();
      const selectedMeeting: IMeetingResult = null;
      this.setState({ rooms: rooms, selectedMeeting: selectedMeeting, selectedRoom: selectedRoom });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_getAvailableRooms) - ${err}`, LogLevel.Error);
      return null;
    }
  }

  private _bookRoom = async (meeting: IMeetingResult) => {
    try {
      const config = cloneDeep(rr.Config);
      let newMeeting = find(config.meetings, { meetingId: this.state.selectedMeeting.meetingId });
      newMeeting.roomId = this.state.selectedRoom.roomId;
      newMeeting.roomName = this.state.selectedRoom.displayName;
      let success = await rr.UpdateConfig(config);
      if (success) {
        meeting.roomName = this.state.selectedRoom.displayName;
        meeting.roomId = this.state.selectedRoom.roomId;
        const meetings: IMeetingResult[] = rr.GetMeetings();
        this.setState({ selectedMeeting: meeting, meetings: meetings, scheduled: true });
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_bookRoom) - ${err}`, LogLevel.Error);
      return null;
    }
  }

  public render(): React.ReactElement<IRoomReservationProps> {
    try {
      return (
        <div className={styles.roomReservation}>
          <div className="meeting-grid">
            <h2 className="meeting-headline">{strings.MyMeetingsHeader}</h2>
            <Meetings meetings={this.state.meetings} onSelect={this._setSelectedMeeting} checkAvailability={this._getAvailableRooms} />
            <MeetingStage
              bookRoom={this._bookRoom}
              selectedMeeting={this.state.selectedMeeting}
              selectedRoom={this.state.selectedRoom}
              selectRoom={this._setRoom}
              rooms={this.state.rooms}
              scheduled={this.state.scheduled} />
          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }

  }
}
