import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";

import strings from "CovidWebPartStrings";
import Button from "../atoms/Button";

export interface IConfigureProps {
  startConfigure: () => void;
}

export interface IConfigureState {
  working: boolean;
}

export class ConfigureState implements IConfigureState {
  constructor(
    public working: boolean = false
  ) { }
}

export default class Configure extends React.Component<IConfigureProps, IConfigureState> {
  private LOG_SOURCE: string = "🔶Configure";

  constructor(props: IConfigureProps) {
    super(props);
    this.state = new ConfigureState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IConfigureProps>, nextState: Readonly<IConfigureState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _startConfigure = () => {
    this.setState({ working: true }, () => {
      this.props.startConfigure();
    });
  }

  public render(): React.ReactElement<IConfigureProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE}>
          <div>{strings.ConfigurationNeeded}</div>
          <Button className="hoo-button-primary" disabled={false} label={strings.ConfigureNow} onClick={this._startConfigure} />
          {this.state.working &&
            <div>LOADING</div>
          }
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}