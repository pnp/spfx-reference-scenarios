import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";

export interface IWorldClockProps {
}

export interface IWorldClockState {
}

export class WorldClockState implements IWorldClockState {
  constructor() { }
}

export default class WorldClock extends React.Component<IWorldClockProps, IWorldClockState> {
  private LOG_SOURCE: string = "WorldClock";

  constructor(props: IWorldClockProps) {
    super(props);
    this.state = new WorldClockState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IWorldClockProps>, nextState: Readonly<IWorldClockState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IWorldClockProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE}>
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}