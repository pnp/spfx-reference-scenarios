import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "@microsoft/sp-lodash-subset";
import { IIconType } from "../../models/rr.Icons";

export interface IButtonCommandProps {
  iconType: IIconType;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  label: string;
}

export interface IButtonCommandState {
}

export class ButtonCommandState implements IButtonCommandState {
  constructor() { }
}

export default class ButtonCommand extends React.Component<IButtonCommandProps, IButtonCommandState> {
  private LOG_SOURCE: string = "🔶 ButtonCommand";

  constructor(props: IButtonCommandProps) {
    super(props);
    this.state = new ButtonCommandState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IButtonCommandProps>, nextState: Readonly<IButtonCommandState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IButtonCommandProps> {
    try {
      return (
        <div className="hoo-buttoncmd" aria-haspopup="true" data-component={this.LOG_SOURCE}>
          <button className="hoo-buttoncmd" aria-haspopup="true" onClick={this.props.onClick}>
            <span className="hoo-button-icon" aria-hidden="true">
              <div className="hoo-icon">
                <span className={`hoo-icon-svg ${this.props.iconType.Class}`} aria-hidden="true" dangerouslySetInnerHTML={{ "__html": this.props.iconType.SVG }} >
                </span>
              </div>
            </span>
            <span className="hoo-button-label">{this.props.label}</span>
          </button>
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}