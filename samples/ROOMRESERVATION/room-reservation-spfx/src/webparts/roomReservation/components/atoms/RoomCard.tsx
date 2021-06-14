import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";
import { IBuilding, IRoom, Room } from "../../models/rr.models";
import { rr } from "../../services/rr.service";

export interface IRoomCardProps {
  room: IRoom;
  building: IBuilding;
}

export interface IRoomCardState {
}

export class RoomCardState implements IRoomCardState {
  constructor() { }
}

export default class RoomCard extends React.Component<IRoomCardProps, IRoomCardState> {
  private LOG_SOURCE: string = "🔶 RoomCard";

  constructor(props: IRoomCardProps) {
    super(props);
    this.state = new RoomCardState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IRoomCardProps>, nextState: Readonly<IRoomCardState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IRoomCardProps> {
    try {
      return (
        <div className="hoo-meetingcard" data-component={this.LOG_SOURCE}>
          <div className="hoo-cardimage">
            <img src="../../images/card-images/meeting-cards/card-1.jpg" width="320" height="180" alt="" />
          </div>
          <div className="hoo-cardlocation">{this.props.building.displayName}</div>
          <div className="hoo-cardtitle">{this.props.room.displayName}</div>
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}