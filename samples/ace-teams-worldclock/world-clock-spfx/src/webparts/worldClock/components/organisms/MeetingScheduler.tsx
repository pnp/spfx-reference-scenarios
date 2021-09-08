import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import { isEqual } from "@microsoft/sp-lodash-subset";

import { IPerson } from "../../models/wc.models";
import Scheduler from "../molecules/Scheduler";


export interface IMeetingSchedulerProps {
  meetingMembers: IPerson[];
  currentUser: IPerson;
  removeFromMeeting: (IPerson) => void;
}

export interface IMeetingSchedulerState {
}

export class MeetingSchedulerState implements IMeetingSchedulerState {
  constructor() { }
}

export default class MeetingScheduler extends React.Component<IMeetingSchedulerProps, IMeetingSchedulerState> {
  private LOG_SOURCE: string = "🔶 MeetingScheduler";

  constructor(props: IMeetingSchedulerProps) {
    super(props);
    this.state = new MeetingSchedulerState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IMeetingSchedulerProps>, nextState: Readonly<IMeetingSchedulerState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IMeetingSchedulerProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE}>
          <Scheduler
            meetingMembers={this.props.meetingMembers}
            removeFromMeeting={this.props.removeFromMeeting} />
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}