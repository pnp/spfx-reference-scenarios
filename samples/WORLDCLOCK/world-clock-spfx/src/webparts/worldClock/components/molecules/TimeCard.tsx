import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { endsWith, isEqual, replace } from "lodash";
import { DateTime } from "luxon";
import { IPerson } from "../../models/wc.models";
import { wc } from "../../services/wc.service";

export interface ITimeCardProps {
  currentTime: DateTime;
  members: IPerson[];
  currentTimeZone: string;
}

export interface ITimeCardState {
}

export class TimeCardState implements ITimeCardState {
  constructor() { }
}

export default class TimeCard extends React.Component<ITimeCardProps, ITimeCardState> {
  private LOG_SOURCE: string = "🔶 TimeCard";
  private _IANATimeZone: string = "";
  private _members: IPerson[] = [];

  constructor(props: ITimeCardProps) {
    super(props);
    this._members = this.props.members as IPerson[];
    (this._members.length > 0) ? this._IANATimeZone = this._members[0].IANATimeZone : this._IANATimeZone = this.props.currentTimeZone;
    this.state = new TimeCardState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ITimeCardProps>, nextState: Readonly<ITimeCardState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ITimeCardProps> {
    try {
      let showAMPM: boolean = false;
      let currentTime: string = this.props.currentTime.setZone(this._IANATimeZone).toLocaleString(DateTime.TIME_SIMPLE);
      if ((endsWith(currentTime.toLocaleLowerCase(), "am")) || (endsWith(currentTime.toLocaleLowerCase(), "pm"))) {
        currentTime = replace(currentTime, this.props.currentTime.setZone(this._IANATimeZone).toFormat("a"), "");
        showAMPM = true;
      }

      return (
        <div data-component={this.LOG_SOURCE} className={`hoo-wc-clock ${(this.props.currentTimeZone == this._IANATimeZone) ? "is-current-me" : ""}`}>
          <div className="hoo-wc-time">{currentTime}<span className="hoo-wc-ampm">{(showAMPM) ? this.props.currentTime.setZone(this._IANATimeZone).toFormat("a") : ""}</span></div>
          <div className="hoo-wc-peoples">
            {this._members.map((m) => {
              return (<div className="hoo-wc-people" title="Add to Meeting">{m.displayName}</div>);
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