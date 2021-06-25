import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";

export interface ILabelProps {
  labelFor: string;
  label: string;
}

export interface ILabelState {
}

export class LabelState implements ILabelState {
  constructor() { }
}

export default class Label extends React.Component<ILabelProps, ILabelState> {
  private LOG_SOURCE: string = "🔶 Label";

  constructor(props: ILabelProps) {
    super(props);
    this.state = new LabelState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ILabelProps>, nextState: Readonly<ILabelState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ILabelProps> {
    try {
      return (
        <label data-component={this.LOG_SOURCE} className="hoo-label" htmlFor={this.props.labelFor}>{this.props.label}</label>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}