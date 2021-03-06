import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "@microsoft/sp-lodash-subset";
import { IIconType } from "../../../../common/models/designtemplate.models";

export interface IButtonActionProps {
  iconType: IIconType;
  buttonText: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
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
        <button className="hoo-buttonaction" onClick={this.props.onClick}>
          <span className="hoo-button-icon" aria-hidden="true">
            <span className="hoo-icon">
              <span className={`hoo-icon-svg ${this.props.iconType.Class}`} aria-hidden="true" dangerouslySetInnerHTML={{ "__html": this.props.iconType.SVG }} ></span>
            </span>
          </span>
          <span className="hoo-button-label"> {this.props.buttonText} </span>

        </button>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}