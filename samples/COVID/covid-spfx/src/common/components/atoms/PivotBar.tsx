import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "lodash";

export interface IPivotBarOption {
  text: string;
  active: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;

}

export interface IPivotBarProps {
  options: IPivotBarOption[];
}

export interface IPivotBarState {
}

export class PivotBarState implements IPivotBarState {
  constructor() { }
}

export default class PivotBar extends React.Component<IPivotBarProps, IPivotBarState> {
  private LOG_SOURCE: string = "🔶 PivotBar";

  constructor(props: IPivotBarProps) {
    super(props);
    this.state = new PivotBarState();
  }

  public shouldComponentUpdate(nextProps: IPivotBarProps, nextState: IPivotBarState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IPivotBarProps> {
    try {
      return (
        <div className="lqd-pivotbar">
          {this.props.options.map((o, index) => {
            return (
              <button className={`lqd-button-pivot ${(o.active) ? "is-active" : ""}`} onClick={o.onClick}>
                <div className="lqd-pivot-inner" title={o.text}>{o.text}</div>
              </button>);
          })}
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}