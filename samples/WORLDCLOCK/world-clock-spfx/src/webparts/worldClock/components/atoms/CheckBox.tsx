import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";
import styles from "../WorldClock.module.scss";

export interface ICheckBoxProps {
  name: string;
  label: string;
  value: boolean;
  onChange: (fieldValue: string, fieldName: string) => void;
  showLabel?: boolean;
}

export interface ICheckBoxState {
}

export class CheckBoxState implements ICheckBoxState {
  constructor(
  ) { }
}

export default class CheckBox extends React.Component<ICheckBoxProps, ICheckBoxState> {
  private LOG_SOURCE: string = "🔶CheckBox";

  constructor(props: ICheckBoxProps) {
    super(props);
    this.state = new CheckBoxState();
  }

  public shouldComponentUpdate(nextProps: ICheckBoxProps, nextState: ICheckBoxState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _onChange = (newValue: any, fieldName: string) => {
    try {
      this.props.onChange(newValue, fieldName);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onChange) - ${err}`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<ICheckBoxProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} onChange={(newValue) => { this._onChange(newValue.target, this.props.name); }}>
          <input type="checkbox" name={this.props.name} id={this.props.name} checked={this.props.value} className="hoo-checkbox" /><label htmlFor={this.props.name}>{(this.props.showLabel == undefined || this.props.showLabel == true) ? this.props.label : ""}</label>
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}