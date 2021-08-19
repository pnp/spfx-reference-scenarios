import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash-es/isEqual";

export interface ITextBoxProps {
  name: string;
  value: string;
  onChange: (fieldValue: string, fieldName: string) => void;
}

export interface ITextBoxState { }

export class TextBoxState implements ITextBoxState {
  constructor() { }
}

export default class TextBox extends React.Component<ITextBoxProps, ITextBoxState> {
  private LOG_SOURCE: string = "🔶TextBox";

  constructor(props: ITextBoxProps) {
    super(props);
    this.state = new TextBoxState();
  }

  public shouldComponentUpdate(nextProps: ITextBoxProps, nextState: ITextBoxState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _onChange = (newValue: string, fieldName: string) => {
    try {
      this.props.onChange(newValue, fieldName);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onChange) - ${err}`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<ITextBoxProps> {
    try {
      return (
        <div className="textbox">
          <input
            className="hoo-input-text"
            name={this.props.name}
            type="text"
            value={this.props.value}
            placeholder=""
            autoComplete="off"
            onChange={(newValue) => { this._onChange(newValue.target.value, this.props.name); }} />
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}