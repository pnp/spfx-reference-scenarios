import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash-es/isEqual";

export interface ICheckBoxOption {
  key: string;
  text: string;
}

export interface ICheckBoxProps {
  name: string;
  value: string;
  options: ICheckBoxOption[];
  onChange: (fieldValue: string, fieldName: string) => void;
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
      this.props.onChange(newValue.value, fieldName);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onChange) - ${err}`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<ICheckBoxProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className="hoo-radiobutton-group" role="radiogroup" onChange={(newValue) => { this._onChange(newValue.target, this.props.name); }}>
          {this.props.options.map((o) => {
            return (
              <div>
                <input type="checkbox" name={o.key} id={o.key} value="" className="hoo-checkbox" /><label htmlFor={o.key}>{o.text}</label>
              </div>
            );
          })
          }
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}