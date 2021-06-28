import * as React from 'react';
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import cloneDeep from 'lodash/cloneDeep';
import find from 'lodash/find';

import styles from './RoomReservation.module.scss';
import strings from "RoomReservationWebPartStrings";
import { rr } from '../services/rr.service';
import Meetings from './molecules/Meetings';
import { IMeetingResult, IRoomResults, RoomResult } from '../models/rr.models';
import MeetingStage from './organisms/MeetingStage';
import TeamsToolBar from './molecules/TeamsToolBar';
import Panel from './molecules/Panel';
import NewReservation from './molecules/NewReservation';


export interface IRoomReservationProps {
}

export interface IRoomReservationState {
  rooms: IRoomResults[];
  meetings: IMeetingResult[];
  selectedMeeting: IMeetingResult;
  selectedRoom: IRoomResults;
  scheduled: boolean;
  panelVisibility: boolean;
}

export class RoomReservationState implements IRoomReservationState {
  constructor(
    public rooms: IRoomResults[] = [],
    public meetings: IMeetingResult[] = [],
    public selectedMeeting: IMeetingResult = null,
    public selectedRoom: IRoomResults = new RoomResult(),
    public scheduled: boolean = false,
    public panelVisibility: boolean = false
  ) { }
}
export default class RoomReservation extends React.Component<IRoomReservationProps, IRoomReservationState> {
  private LOG_SOURCE: string = "🔶 RoomReservation";
  private _allRooms: IRoomResults[] = rr.GetAllRooms();

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
        const room = find(this._allRooms, { roomId: meeting.roomId, displayName: meeting.roomName });
        this.setState({ selectedMeeting: meeting, selectedRoom: room, scheduled: true });
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_setSelectedMeeting) - ${err}`, LogLevel.Error);
      return null;
    }
  }

  private _setRoom = (room: IRoomResults) => {
    try {
      const meeting = rr.GetRoomDetailsForMeeting(room, this.state.selectedMeeting);
      this.setState({ selectedRoom: room, selectedMeeting: meeting });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_setRoom) - ${err}`, LogLevel.Error);
      return null;
    }
  }

  private _getAvailableRooms = (meeting: IMeetingResult) => {
    try {
      const rooms: IRoomResults[] = rr.GetAvailableRooms(meeting.startTime, meeting.endTime, meeting.attendees);
      const selectedRoom: IRoomResults = new RoomResult();
      this.setState({ rooms: rooms, selectedMeeting: meeting, selectedRoom: selectedRoom, panelVisibility: false });
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

  private _togglePanelVisibility = () => {
    try {
      const panelVisibility: boolean = cloneDeep(this.state.panelVisibility);
      this.setState({ panelVisibility: !panelVisibility });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_togglePanelVisibility) - ${err}`, LogLevel.Error);
      return null;
    }
  }

  public render(): React.ReactElement<IRoomReservationProps> {
    try {
      return (
        <div className={styles.roomReservation}>
          <TeamsToolBar label="Check Availability" onClick={() => this._togglePanelVisibility()} />
          <h2 className="meeting-headline">{strings.MyMeetingsHeader}</h2>
          <Meetings meetings={this.state.meetings} onSelect={this._setSelectedMeeting} />
          <MeetingStage
            bookRoom={this._bookRoom}
            selectedMeeting={this.state.selectedMeeting}
            selectedRoom={this.state.selectedRoom}
            selectRoom={this._setRoom}
            rooms={this.state.rooms}
            scheduled={this.state.scheduled}
            getAvailableRooms={this._getAvailableRooms} />
          <Panel
            header={strings.CheckAvailability}
            content=""
            visible={this.state.panelVisibility}
            onChange={this._togglePanelVisibility}>
            <NewReservation onChange={this._getAvailableRooms} />
          </Panel>
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }

  }
}
