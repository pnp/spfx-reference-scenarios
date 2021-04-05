import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "lodash";
import { IIconType } from "../../covid.model";

export interface IButtonIconProps {
  iconType: IIconType;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export interface IButtonIconState {
}

export class ButtonIconState implements IButtonIconState {
  constructor() { }
}

export default class ButtonIcon extends React.Component<IButtonIconProps, IButtonIconState> {
  private LOG_SOURCE: string = "🔶ButtonIcon";

  constructor(props: IButtonIconProps) {
    super(props);
    this.state = new ButtonIconState();
  }

  public shouldComponentUpdate(nextProps: IButtonIconProps, nextState: IButtonIconState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IButtonIconProps> {
    try {
      return (
        <button className="lqd-buttonicon" aria-label="" onClick={this.props.onClick}>
          <div className="lqd-icon">
            <span className={`lqd-icon-svg ${this.props.iconType.Class}`} aria-hidden="true" dangerouslySetInnerHTML={{ "__html": this.props.iconType.SVG }} >
            </span>

          </div>
        </button>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}