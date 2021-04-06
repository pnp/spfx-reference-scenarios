import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "lodash";

export enum Size {
  "Sixteen" = 16,
  "TwentyFour" = 24,
  "ThirtyTwo" = 32,
  "Forty" = 40,
  "FortyEight" = 48,
  "SixtyFour" = 64,
}
export interface IAvatarProps {
  size: Size;
  src: string;
}

export interface IAvatarState {
}

export class AvatarState implements IAvatarState {
  constructor() { }
}

export default class Avatar extends React.Component<IAvatarProps, IAvatarState> {
  private LOG_SOURCE: string = "🔶Avatar";

  constructor(props: IAvatarProps) {
    super(props);
    this.state = new AvatarState();
  }

  public shouldComponentUpdate(nextProps: IAvatarProps, nextState: IAvatarState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  //To Do  loading="lazy"
  public render(): React.ReactElement<IAvatarProps> {
    try {
      return (
        <div className={`lqd-avatar-${this.props.size}`} >
          <img src={this.props.src} alt="" className="lqd-avatar" height={this.props.size} width={this.props.size} />
        </div >
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}