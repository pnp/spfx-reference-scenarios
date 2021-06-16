import * as React from 'react';
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import { DateTime } from "luxon";

import styles from './RoomReservation.module.scss';
import strings from "RoomReservationWebPartStrings";
import { rr } from '../services/rr.service';
import Meetings from './molecules/Meetings';
import { IMeetingResult, IRoomResults } from '../models/rr.models';
import NewReservation from './molecules/NewReservation';
import MeetingStage from './organisms/MeetingStage';
import { cloneDeep } from 'lodash';



export interface IRoomReservationProps { }

export interface IRoomReservationState {
  rooms: IRoomResults[];
  selectedLocationId: number;
  selectedBuildingId: number;
  selectedRoomId: number;
  selectedMeeting: IMeetingResult;
}

export class RoomReservationState implements IRoomReservationState {
  constructor(
    public rooms: IRoomResults[] = [],
    public selectedLocationId: number = null,
    public selectedBuildingId: number = null,
    public selectedRoomId: number = null,
    public selectedMeeting: IMeetingResult = null
  ) { }
}
export default class RoomReservation extends React.Component<IRoomReservationProps, IRoomReservationState> {
  private LOG_SOURCE: string = "🔶 RoomReservation";

  constructor(props: IRoomReservationProps) {
    super(props);
    let rooms: IRoomResults[] = rr.GetAllRooms();
    this.state = new RoomReservationState(rooms);
  }

  public shouldComponentUpdate(nextProps: Readonly<IRoomReservationProps>, nextState: Readonly<IRoomReservationState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _setSelectedMeeting = (meeting: IMeetingResult) => {
    try {
      if (meeting.roomId == -1) {
        let rooms: IRoomResults[] = [];
        rooms = rr.GetAvailableRooms(meeting.startTime, meeting.endTime, meeting.attendees);
        this.setState({ selectedMeeting: meeting, rooms: rooms });
      } else {
        this.setState({ selectedMeeting: meeting });
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_setSelectedMeeting) - ${err}`, LogLevel.Error);
      return null;
    }
  }
  private _setRoom = (room: IRoomResults) => {
    try {
      let meeting = cloneDeep(this.state.selectedMeeting);
      meeting.roomId = room.roomId;
      meeting.roomName = room.displayName;
      this.setState({ selectedMeeting: meeting });

    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_setMeeting) - ${err}`, LogLevel.Error);
      return null;
    }
  }

  private _getAvailableRooms = (start: DateTime, end: DateTime, participants: number) => {
    try {
      let rooms: IRoomResults[] = [];
      rooms = rr.GetAvailableRooms(start, end, participants);
      this.setState({ rooms: rooms });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_getAvailableRooms) - ${err}`, LogLevel.Error);
      return null;
    }

  }

  public render(): React.ReactElement<IRoomReservationProps> {
    try {
      return (
        <div className={styles.roomReservation}>
          <div className="meeting-grid">
            <h2 className="meeting-headline">{strings.MyMeetingsHeader}</h2>
            <Meetings meetings={rr.Meetings} onSelect={this._setSelectedMeeting} />
            <NewReservation onChange={this._getAvailableRooms} />
            <MeetingStage selectedMeeting={this.state.selectedMeeting} selectRoom={this._setRoom} rooms={this.state.rooms} />
          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }

  }
}
