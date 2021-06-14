import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "lodash";
import { IMeeting } from "../../models/rr.models";
import strings from "RoomReservationWebPartStrings";
import { rr } from "../../services/rr.service";

export interface IMeetingsProps {
  meetings: IMeeting[];
  onSelect: (locationId: number, buildingId: number, roomId: number) => void;
}

export interface IMeetingsState {
}

export class MeetingsState implements IMeetingsState {
  constructor() { }
}

export default class Meetings extends React.Component<IMeetingsProps, IMeetingsState> {
  private LOG_SOURCE: string = "Meetings";

  constructor(props: IMeetingsProps) {
    super(props);
    this.state = new MeetingsState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IMeetingsProps>, nextState: Readonly<IMeetingsState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IMeetingsProps> {
    try {
      return (
        <ul className="meeting-datelist" data-component={this.LOG_SOURCE}>
          {this.props.meetings.map((m) => {
            return (
              <li className="meeting-date" onClick={() => this.props.onSelect(m.locationId, m.buildingId, m.roomId)}>
                <div className="date-details">
                  <div className="date-day">{`${m.displayTime}`}</div>
                  <div className="date-title">{m.subject}</div>
                  <div className="date-title">Room Name</div>
                  <div className="date-persons">{(m.attendees.length > 0) ? `${m.attendees.length} ${strings.AttendeesLabel}` : ""}</div>
                </div>
              </li>
            );
          })}
        </ul>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}