import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";

import strings from "RoomReservationWebPartStrings";
import { IRoomResults } from "../../models/rr.models";
import RoomCard from "../atoms/RoomCard";

export interface IMeetingRoomsProps {
  rooms: IRoomResults[];
  selectRoom: (room: IRoomResults) => void;
}

export interface IMeetingRoomsState {
}

export class MeetingRoomsState implements IMeetingRoomsState {
  constructor() { }
}

export default class MeetingRooms extends React.Component<IMeetingRoomsProps, IMeetingRoomsState> {
  private LOG_SOURCE: string = "🔶 MeetingRooms";

  constructor(props: IMeetingRoomsProps) {
    super(props);
    this.state = new MeetingRoomsState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IMeetingRoomsProps>, nextState: Readonly<IMeetingRoomsState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IMeetingRoomsProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE}>
          <h2 className="meeting-headline">{strings.AvailableRoomsLabel}</h2>
          <div className="meeting-room-selector">
            {(this.props.rooms.length > 0) ?
              <div className="meeting-rooms">
                {
                  this.props.rooms.map((r) => {
                    return (<RoomCard room={r} selectRoom={this.props.selectRoom} />);
                  })
                }
              </div>
              :
              <div className="meeting-rooms-none">
                {strings.NoRooms}
              </div>

            }
          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}