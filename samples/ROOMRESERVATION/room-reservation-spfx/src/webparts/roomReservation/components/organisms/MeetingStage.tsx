import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";

import { IMeetingResult, IRoomResults } from "../../models/rr.models";
import MeetingRooms from "../molecules/MeetingRooms";
import MeetingSelection from "./MeetingSelection";


export interface IMeetingStageProps {
  bookRoom: (selectedMeeting: IMeetingResult) => void;
  rooms: IRoomResults[];
  selectedMeeting: IMeetingResult;
  selectedRoom: IRoomResults;
  selectRoom: (room: IRoomResults) => void;
  scheduled: boolean;
}

export interface IMeetingStageState {
}

export class MeetingStageState implements IMeetingStageState {
  constructor() { }
}

export default class MeetingStage extends React.Component<IMeetingStageProps, IMeetingStageState> {
  private LOG_SOURCE: string = "🔶 MeetingStage";

  constructor(props: IMeetingStageProps) {
    super(props);
    this.state = new MeetingStageState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IMeetingStageProps>, nextState: Readonly<IMeetingStageState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IMeetingStageProps> {
    try {
      return (
        <div className="meeting-stage" data-component={this.LOG_SOURCE}>
          {(this.props.selectedMeeting.roomId == -1 && !this.props.scheduled) &&
            <MeetingRooms rooms={this.props.rooms} selectRoom={this.props.selectRoom} />
          }
          { (this.props.selectedMeeting && this.props.selectRoom) &&
            <MeetingSelection
              meeting={this.props.selectedMeeting}
              room={this.props.selectedRoom}
              scheduled={this.props.scheduled}
              bookRoom={this.props.bookRoom} />
          }
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}