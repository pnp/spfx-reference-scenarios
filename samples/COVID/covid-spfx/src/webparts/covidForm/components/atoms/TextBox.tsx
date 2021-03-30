import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "lodash";

export interface ITextBoxProps {
  name: string;
  onChange: (fieldValue: string, fieldName: string) => void;
}

export interface ITextBoxState {
  value: string;
}

export class TextBoxState implements ITextBoxState {
  constructor(
    public value: string = ""
  ) { }
}

export default class TextBox extends React.Component<ITextBoxProps, ITextBoxState> {
  private LOG_SOURCE: string = "TextBox";

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
      this.setState({ value: newValue });
      this.props.onChange(newValue, fieldName);
    } catch (err) {
      Logger.write(`${err} - ${this.LOG_SOURCE} (textFieldChanged)`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<ITextBoxProps> {
    try {
      return (
        <div className="textbox">
          <input className="lqd-input-text" name={'question-' + this.props.name} type="text" value={this.state.value} placeholder="" onChange={(newValue) => { this._onChange(newValue.target.value, this.props.name); }} />
        </div>
      );
    } catch (err) {
      Logger.write(`${err} - ${this.LOG_SOURCE} (render)`, LogLevel.Error);
      return null;
    }
  }
}