import * as React from 'react';
import styles from './RoomReservation.module.scss';
import { isEqual } from '@microsoft/sp-lodash-subset';
import Meetings from './molecules/Meetings';
import strings from "RoomReservationWebPartStrings";
import { rr } from '../services/rr.service';
import MeetingRooms from './molecules/MeetingRooms';
import { Logger, LogLevel } from "@pnp/logging";
import MeetingSelection from './organisms/MeetingSelection';


export interface IRoomReservationProps { }

export interface IRoomReservationState {
  selectedLocationId: number;
  selectedBuildingId: number;
  selectedRoomId: number;
}

export class RoomReservationState implements IRoomReservationState {
  constructor(
    public selectedLocationId: number = null,
    public selectedBuildingId: number = null,
    public selectedRoomId: number = null
  ) { }
}
export default class RoomReservation extends React.Component<IRoomReservationProps, IRoomReservationState> {
  private LOG_SOURCE: string = "🔶 RoomReservation";

  constructor(props: IRoomReservationProps) {
    super(props);
    this.state = new RoomReservationState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IRoomReservationProps>, nextState: Readonly<IRoomReservationState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _setSelectedMeetingRoom = (locationId: number, buildingId: number, roomId: number) => {
    this.setState({ selectedLocationId: locationId, selectedBuildingId: buildingId, selectedRoomId: roomId });
  }

  public render(): React.ReactElement<IRoomReservationProps> {
    try {
      return (
        <div className={styles.roomReservation}>
          <div className="meeting-grid">
            <h2 className="meeting-headline">{strings.MyMeetingsHeader}</h2>
            <Meetings meetings={rr.Meetings} onSelect={this._setSelectedMeetingRoom} />
            <div className="meeting-stage">
              <MeetingRooms />
              <MeetingSelection />
            </div>
          </div>
Your upcoming meetings:
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }

  }
}
