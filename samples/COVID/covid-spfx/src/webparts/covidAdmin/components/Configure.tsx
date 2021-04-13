import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "lodash";
import Button from "../../../common/components/atoms/Button";

export interface IConfigureProps {
  startConfigure: () => void;
}

export interface IConfigureState {
}

export class ConfigureState implements IConfigureState {
  constructor() { }
}

export default class Configure extends React.Component<IConfigureProps, IConfigureState> {
  private LOG_SOURCE: string = "Configure";

  constructor(props: IConfigureProps) {
    super(props);
    this.state = new ConfigureState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IConfigureProps>, nextState: Readonly<IConfigureState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IConfigureProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE}>
          <div>It appears the Covid Attestation application has not been configured.</div>
          <Button className="hoo-button-primary" disabled={false} label="Configure Now" onClick={this.props.startConfigure} />
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}