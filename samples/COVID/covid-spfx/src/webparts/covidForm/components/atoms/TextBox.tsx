import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "lodash";
import styles from '../CovidForm.module.scss';
import { IQuestion } from "../../../../common/covid.model";

export interface ITextBoxProps {
  question: IQuestion;
  onChange: (fieldName: string, questionID: number) => void;
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

  private _onChange = (newValue: string, questionID: number) => {
    try {
      this.setState({ value: newValue });
      this.props.onChange(newValue, questionID);
    } catch (err) {
      Logger.write(`${err} - ${this.LOG_SOURCE} (textFieldChanged)`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<ITextBoxProps> {
    try {
      return (
        <div className="textbox">
          <input className="lqd-input-text" name={'question-' + this.props.question.Id} type="text" value={this.state.value} placeholder="" onChange={(newValue) => { this._onChange(newValue.target.value, this.props.question.Id); }} />
        </div>
      );
    } catch (err) {
      Logger.write(`${err} - ${this.LOG_SOURCE} (render)`, LogLevel.Error);
      return null;
    }
  }
}