import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "lodash";
import ButtonIcon from "../atoms/ButtonIcon";
import { Icons } from "../../enums";
import Avatar, { Size } from "../atoms/Avatar";

export enum Presence {
  "Available" = "is-online",
  "AvailableIdle" = "is-away",
  "Away" = "is-away",
  "BeRightBack" = "is-away",
  "Busy" = "is-dnd",
  "BusyIdle" = "is-dnd",
  "DoNotDisturb" = "is-dnd",
  "Offline" = "is-invisible",
  "PresenceUnknown" = "is-oof",
}

export interface IPersonaProps {
  size: Size;
  src: string;
  name: string;
  jobTitle: string;
  presence: Presence;
  status: string;
  showPresence: boolean;
}

export interface IPersonaState {
}

export class PersonaState implements IPersonaState {
  constructor() { }
}

export default class Persona extends React.Component<IPersonaProps, IPersonaState> {
  private LOG_SOURCE: string = "🔶Persona";

  constructor(props: IPersonaProps) {
    super(props);
    this.state = new PersonaState();
  }

  public shouldComponentUpdate(nextProps: IPersonaProps, nextState: IPersonaState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IPersonaProps> {
    try {

      return (
        <div className={`lqd-persona-${this.props.size}`}>
          <div className="lqd-avatar-pres">
            <Avatar size={this.props.size} src={this.props.src} />
            <div className={`lqd-presence ${this.props.presence}`} title="Online"></div>
          </div>
          <div className="lqd-persona-data">
            <div className="lqd-persona-name">{this.props.name}</div>
            <div className="lqd-persona-function"><span>{this.props.jobTitle}</span></div>
            <div className="lqd-persona-statustext"><span>{this.props.status}</span></div>
            <div className="lqd-persona-available"><span>Call me yesterday</span></div>
          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}