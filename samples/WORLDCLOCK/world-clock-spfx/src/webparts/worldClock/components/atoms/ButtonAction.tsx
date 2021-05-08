import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";
import { IIconType } from "../../models/wc.Icons";

export interface IButtonActionProps {
  iconType: IIconType;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  label: string;
}

export interface IButtonActionState {
}

export class ButtonActionState implements IButtonActionState {
  constructor() { }
}

export default class ButtonAction extends React.Component<IButtonActionProps, IButtonActionState> {
  private LOG_SOURCE: string = "🔶ButtonAction";

  constructor(props: IButtonActionProps) {
    super(props);
    this.state = new ButtonActionState();
  }

  public shouldComponentUpdate(nextProps: IButtonActionProps, nextState: IButtonActionState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IButtonActionProps> {
    try {
      return (
        < button className="hoo-buttonaction" onClick={this.props.onClick} >
          <span className="hoo-button-icon" aria-hidden="true">
            <div className="hoo-icon">
              <span className={`hoo-icon-svg ${this.props.iconType.Class}`} aria-hidden="true" dangerouslySetInnerHTML={{ "__html": this.props.iconType.SVG }} ></span>
            </div>
          </span>
          <span className="hoo-button-label">{this.props.label}</span>
        </button >
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}