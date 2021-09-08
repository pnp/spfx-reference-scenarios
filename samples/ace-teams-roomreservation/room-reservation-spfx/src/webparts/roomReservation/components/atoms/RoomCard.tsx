import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import { isEqual } from "@microsoft/sp-lodash-subset";

import { IRoomResults } from "../../models/rr.models";

export interface IRoomCardProps {
  room: IRoomResults;
  selectRoom: (room: IRoomResults) => void;
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
      const imageSrc: any = require(`../assets/card-${this.props.room.roomId}.jpg`);
      return (
        <div className="hoo-meetingcard" data-component={this.LOG_SOURCE} onClick={() => this.props.selectRoom(this.props.room)}>
          <div className="hoo-cardimage">
            <img src={imageSrc} width="320" height="180" alt={this.props.room.displayName} />
          </div>
          <div className="hoo-cardlocation">{this.props.room.buildingName}</div>
          <div className="hoo-cardtitle">{this.props.room.displayName}</div>
          <div className="hoo-cardcapacity">{`Capacity: ${this.props.room.maxOccupancy}`}</div>
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}