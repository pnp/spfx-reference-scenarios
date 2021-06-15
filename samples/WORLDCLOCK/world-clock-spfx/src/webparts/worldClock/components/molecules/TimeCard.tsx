import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import replace from "lodash/replace";
import cloneDeep from "lodash/cloneDeep";
import find from "lodash/find";
import endsWith from "lodash/endsWith";


import { DateTime } from "luxon";
import { IPerson } from "../../models/wc.models";
import ButtonIcon from "../atoms/ButtonIcon";
import { Icons } from "../../models/wc.Icons";
import strings from "WorldClockWebPartStrings";
import { wc } from "../../services/wc.service";

export interface ITimeCardProps {
  currentTime: DateTime;
  members: IPerson[];
  addToMeeting: (IPerson) => void;
  meetingMembers: IPerson[];
  editProfile: (boolean) => void;
}

export interface ITimeCardState {
  showAMPM: string;
  currentTimeString: string;
  currentTimeZone: string;
}

export class TimeCardState implements ITimeCardState {
  constructor(
    public showAMPM: string = "",
    public currentTimeString: string = "",
    public currentTimeZone: string = ""
  ) { }
}

export default class TimeCard extends React.Component<ITimeCardProps, ITimeCardState> {
  private LOG_SOURCE: string = "🔶 TimeCard";
  private _timeChanged: boolean = false;

  constructor(props: ITimeCardProps) {
    super(props);
    this.state = new TimeCardState();
  }

  public componentDidMount() {
    this._updateTime();
  }

  public shouldComponentUpdate(nextProps: Readonly<ITimeCardProps>, nextState: Readonly<ITimeCardState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    if (!isEqual(nextProps.currentTime, this.props.currentTime)) {
      this._timeChanged = true;
    }
    return true;
  }

  public componentDidUpdate() {
    try {
      if (this._timeChanged) {
        this._timeChanged = false;
        this._updateTime();
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (componentDidUpdate) - ${err}`, LogLevel.Error);
    }
  }

  private _updateTime = () => {
    try {
      const currentTimeZone: string = this.props.members[0]?.IANATimeZone || wc.IANATimeZone;
      let showAMPM: string = "";
      let currentTime: DateTime = cloneDeep(this.props.currentTime);
      currentTime = currentTime.setZone(currentTimeZone);
      let currentTimeString: string = currentTime.toLocaleString(DateTime.TIME_SIMPLE);
      if ((endsWith(currentTimeString.toLocaleLowerCase(), "am")) || (endsWith(currentTimeString.toLocaleLowerCase(), "pm"))) {
        showAMPM = currentTime.toFormat("a");
        currentTimeString = replace(currentTimeString, ` ${showAMPM}`, "");
      }
      this.setState({ showAMPM, currentTimeString, currentTimeZone });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_updateTime) - ${err}`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<ITimeCardProps> {
    try {
      if (this.state.currentTimeString == "") { return null; }
      return (
        <div data-component={this.LOG_SOURCE} className={`hoo-wc-clock ${(this.state.currentTimeZone == wc.IANATimeZone) ? "is-current-me" : ""}`}>
          <div className="hoo-wc-time">{this.state.currentTimeString}<span className="hoo-wc-ampm">{this.state.showAMPM}</span></div>
          <div className="hoo-wc-peoples hoo-overflow">
            {this.props.members.map((m) => {
              const _inMeeting: IPerson = find(this.props.meetingMembers, { personId: m.personId });
              const _isCurrentUser: boolean = wc.CurrentUser.personId == m.personId;
              return (<div className="hoo-wc-people" title={m.displayName}>
                <span className="hoo-wc-people-name">{m.displayName}</span>
                {((!_isCurrentUser) && (!_inMeeting)) &&
                  <ButtonIcon
                    iconType={Icons.PlusPerson}
                    onClick={() => this.props.addToMeeting(m)}
                    altText={strings.AddToMeetingLabel} />
                }
                {(_isCurrentUser) &&
                  <ButtonIcon
                    iconType={Icons.Profile}
                    onClick={() => this.props.editProfile(true)}
                    altText={strings.EditProfileLabel} />
                }
              </div>);
            })
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