import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash-es/isEqual";

export interface IRadioButtonProps {
  name: string;
  value: string;
  onChange: (fieldValue: string, fieldName: string) => void;
}

export interface IRadioButtonState {
}

export class RadioButtonState implements IRadioButtonState {
  constructor(
  ) { }
}

export default class RadioButton extends React.Component<IRadioButtonProps, IRadioButtonState> {
  private LOG_SOURCE: string = "🔶RadioButton";

  constructor(props: IRadioButtonProps) {
    super(props);
    this.state = new RadioButtonState();
  }

  public shouldComponentUpdate(nextProps: IRadioButtonProps, nextState: IRadioButtonState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _onChange = (newValue: any, fieldName: string) => {
    try {
      this.props.onChange(newValue.value, fieldName);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onChange) - ${err}`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<IRadioButtonProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className="radio" onChange={(newValue) => { this._onChange(newValue.target, this.props.name); }}>
          <input type="radio" name={this.props.name} id={`${this.props.name}-Yes`} value="Yes" className="hoo-radio" /><label htmlFor={`${this.props.name}-Yes`}>Yes</label>
          <input type="radio" name={this.props.name} id={`${this.props.name}-No`} value="No" className="hoo-radio" /><label htmlFor={`${this.props.name}-No`}>No</label>
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}