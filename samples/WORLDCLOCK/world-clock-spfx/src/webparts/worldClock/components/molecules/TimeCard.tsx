import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { endsWith, find, isEqual, replace } from "lodash";
import { DateTime } from "luxon";
import { IPerson } from "../../models/wc.models";
import ButtonIcon from "../atoms/ButtonIcon";
import { Icons } from "../../models/wc.Icons";
import strings from "WorldClockWebPartStrings";
import { IOverflowResizer, OverflowResizer } from "../../services/OverflowResizer";

export interface ITimeCardProps {
  currentTime: DateTime;
  members: IPerson[];
  currentTimeZone: string;
  userId: string;
  addToMeeting: (IPerson) => void;
  meetingMembers: IPerson[];
  editProfile: (boolean) => void;
}

export interface ITimeCardState {
}

export class TimeCardState implements ITimeCardState {
  constructor() { }
}

export default class TimeCard extends React.Component<ITimeCardProps, ITimeCardState> {
  private LOG_SOURCE: string = "🔶 TimeCard";
  private _IANATimeZone: string = "";
  private _overFlowResizer: IOverflowResizer;
  private _peopleContainer: React.RefObject<HTMLDivElement>;

  constructor(props: ITimeCardProps) {
    super(props);
    (this.props.members.length > 0) ? this._IANATimeZone = this.props.members[0].IANATimeZone : this._IANATimeZone = this.props.currentTimeZone;
    this.state = new TimeCardState();
    this._peopleContainer = React.createRef<HTMLDivElement>();
    this._overFlowResizer = new OverflowResizer(`TC-${props.currentTime.hour}`);
  }

  public componentDidMount() {
    try {
      if (this._peopleContainer.current != undefined) {
        this._overFlowResizer.ObserveElement = this._peopleContainer.current;
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (componentDidMount) - ${err}`, LogLevel.Error);
    }
  }

  public shouldComponentUpdate(nextProps: Readonly<ITimeCardProps>, nextState: Readonly<ITimeCardState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _expandMenu = () => {
    Logger.write(`${this.LOG_SOURCE} (_expandMenu) - FIRED`, LogLevel.Info);
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
          <div ref={this._peopleContainer} className="hoo-wc-peoples hoo-overflow">
            {this.props.members.map((m) => {
              let inMeeting: IPerson = find(this.props.meetingMembers, { personId: m.personId });
              return (<div className="hoo-wc-people" title={m.displayName}>
                <span className="hoo-wc-people-name">{m.displayName}</span>
                {((this.props.userId != m.personId) && (!inMeeting)) &&

                  <ButtonIcon
                    iconType={Icons.PlusPerson}
                    onClick={() => this.props.addToMeeting(m)}
                    altText={strings.AddToMeetingLabel} />
                }
                {(this.props.userId == m.personId) &&
                  <ButtonIcon
                    iconType={Icons.Profile}
                    onClick={() => this.props.editProfile(true)}
                    altText={strings.EditProfileLabel} />
                }

              </div>);
            })
            }
            {/*<div className="hoo-buttonicon-overflow" aria-haspopup="true">
              <ButtonIcon className="hoo-buttonicon-overflow" iconType={Icons.DownArrow} onClick={this._expandMenu} altText={strings.ExpandPeopleList} />
              <ul className="hoo-buttonflyout" role="menu">
              </ul>
          </div>*/}
          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}