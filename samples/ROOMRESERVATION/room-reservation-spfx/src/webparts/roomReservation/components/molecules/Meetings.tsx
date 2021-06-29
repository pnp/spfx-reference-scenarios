import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import strings from "RoomReservationWebPartStrings";
import { IMeetingResult } from "../../models/rr.models";

export interface IMeetingsProps {
  meetings: IMeetingResult[];
  onSelect: (meeting: IMeetingResult) => void;
}

export interface IMeetingsState {
}

export class MeetingsState implements IMeetingsState {
  constructor() { }
}

export default class Meetings extends React.Component<IMeetingsProps, IMeetingsState> {
  private LOG_SOURCE: string = "🔶 Meetings";

  constructor(props: IMeetingsProps) {
    super(props);
    this.state = new MeetingsState();
  }

  public render(): React.ReactElement<IMeetingsProps> {
    try {
      return (
        <>
          {(this.props.meetings.length > 0) ?
            <ul className="meeting-datelist" data-component={this.LOG_SOURCE}>
              {
                this.props.meetings.map((m) => {
                  return (
                    <li className="meeting-date" onClick={() => this.props.onSelect(m)}>
                      <div className="date-details">
                        <div className="date-title">{`${m.subject}`}</div>
                        <div className="date-day">{`${m.displayTime}`}</div>
                        <div className="date-room">{(m.roomName == "") ? strings.NoRoomSelected : m.roomName}</div>
                        <div className="date-persons">{(m.attendees > 0) ? `${m.attendees} ${strings.AttendeesLabel}` : ""}</div>
                      </div>
                    </li>
                  );
                })
              }
            </ul>
            :
            <div className="meeting-room-selector">
              <div className="meeting-rooms-none">
                {strings.NoRooms}
              </div>
            </div>
          }

        </>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}