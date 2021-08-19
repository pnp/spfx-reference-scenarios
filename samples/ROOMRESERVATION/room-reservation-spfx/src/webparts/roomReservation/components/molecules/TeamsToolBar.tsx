import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash-es/isEqual";

import { Icons } from "../../models/rr.Icons";

export interface ITeamsToolBarProps {
  label: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export interface ITeamsToolBarState {
}

export class TeamsToolBarState implements ITeamsToolBarState {
  constructor() { }
}

export default class TeamsToolBar extends React.Component<ITeamsToolBarProps, ITeamsToolBarState> {
  private LOG_SOURCE: string = "🔶 TeamsToolBar";

  constructor(props: ITeamsToolBarProps) {
    super(props);
    this.state = new TeamsToolBarState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ITeamsToolBarProps>, nextState: Readonly<ITeamsToolBarState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ITeamsToolBarProps> {
    try {
      return (
        <div className="hoo-teams-toolbar" data-component={this.LOG_SOURCE}>
          <div className="hoo-buttoncmd">
            <button className="hoo-buttoncmd" onClick={this.props.onClick}>
              <span className="hoo-button-icon" aria-hidden="true"> <div className="hoo-icon">
                <span className={`hoo-icon-svg ${Icons.Check.Class}`} aria-hidden="true" dangerouslySetInnerHTML={{ "__html": Icons.Check.SVG }} >
                </span>
              </div> </span>
              <span className="hoo-button-label">{this.props.label}</span>
            </button>
          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}