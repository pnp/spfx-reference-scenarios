import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "lodash";
import styles from '../CovidForm.module.scss';
import { IQuestion } from "../../../../common/covid.model";

export interface IToggleProps {
  question: IQuestion;
  onChange: (fieldName: string, questionID: number) => void;
}

export interface IToggleState {
  value: boolean;
}

export class ToggleState implements IToggleState {
  constructor(
    public value: boolean = false
  ) { }
}

export default class Toggle extends React.Component<IToggleProps, IToggleState> {
  private LOG_SOURCE: string = "Toggle";

  constructor(props: IToggleProps) {
    super(props);
    this.state = new ToggleState();
  }

  public shouldComponentUpdate(nextProps: IToggleProps, nextState: IToggleState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _onChange = (newValue: boolean, questionID: number) => {
    try {
      this.setState({ value: newValue });
      this.props.onChange(newValue.toString(), questionID);
    } catch (err) {
      Logger.write(`${err} - ${this.LOG_SOURCE} (textFieldChanged)`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<IToggleProps> {
    try {
      return (
        <div className="toggle">
          <div className="lqd-toggle">
            <input type="checkbox" className="lqd-toggle-cb" name={'question-' + this.props.question.Id} id={'question-' + this.props.question.Id} checked={this.state.value} onChange={(newValue) => { this._onChange(newValue.target.checked, this.props.question.Id); }} />
            <label htmlFor={'question-' + this.props.question.Id} className="lqd-toggle-label" title={this.props.question.ToolTip}>
              <span className="lqd-toggle-slider"></span>
              <span className="lqd-toggle-checked">Yes</span>
              <span className="lqd-toggle-unchecked">No</span>
            </label>
          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`${err} - ${this.LOG_SOURCE} (render)`, LogLevel.Error);
      return null;
    }
  }
}