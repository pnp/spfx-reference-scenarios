import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";

export interface ILoadingProps {
}

export interface ILoadingState {
}

export class LoadingState implements ILoadingState {
  constructor() { }
}

export default class Loading extends React.Component<ILoadingProps, ILoadingState> {
  private LOG_SOURCE: string = "🔶Loading";

  constructor(props: ILoadingProps) {
    super(props);
    this.state = new LoadingState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ILoadingProps>, nextState: Readonly<ILoadingState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ILoadingProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className="hoo-ph-primary">
          <div className="hoo-ph-primary hoo-ph-squared"></div>
          <div className="hoo-ph-primary hoo-ph-squared"></div>
          <div className="hoo-ph-primary hoo-ph-squared"></div>
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}