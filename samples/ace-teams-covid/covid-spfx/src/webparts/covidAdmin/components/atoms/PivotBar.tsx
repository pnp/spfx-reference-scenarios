import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "@microsoft/sp-lodash-subset";

import { ADMINTABS } from "../../models/covid.model";

export interface IPivotBarOption {
  key: ADMINTABS;
  displayName: string;
}

export interface IPivotBarProps {
  options: IPivotBarOption[];
  onClick: (tab: ADMINTABS) => void;
  activeTab: ADMINTABS;
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
        <div className="hoo-pivotbar">
          {this.props.options.map((o, index) => {
            return (
              <button className={`hoo-button-pivot ${(o.key === this.props.activeTab) ? "is-active" : ""}`} onClick={() => { this.props.onClick(o.key); }}>
                <div className="hoo-pivot-inner" title={o.displayName}>{o.displayName}</div>
              </button>
            );
          })}
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}