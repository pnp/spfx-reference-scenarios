import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "lodash";
import styles from '../CovidForm.module.scss';
import { IQuestion } from "../../../../common/covid.model";

export interface IRadioButtonProps {
  question: IQuestion;
  onChange: (fieldName: string, questionID: number) => void;
}

export interface IRadioButtonState {
}

export class RadioButtonState implements IRadioButtonState {
  constructor(
  ) { }
}

export default class RadioButton extends React.Component<IRadioButtonProps, IRadioButtonState> {
  private LOG_SOURCE: string = "RadioButton";

  constructor(props: IRadioButtonProps) {
    super(props);
    this.state = new RadioButtonState();
  }

  public shouldComponentUpdate(nextProps: IRadioButtonProps, nextState: IRadioButtonState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _onChange = (newValue: any, questionID: number) => {
    try {
      this.props.onChange(newValue.value, questionID);
    } catch (err) {
      Logger.write(`${err} - ${this.LOG_SOURCE} (_onChange)`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<IRadioButtonProps> {
    try {
      return (
        <div className={styles.radio} onChange={(newValue) => { this._onChange(newValue.target, this.props.question.Id); }}>
          <input type="radio" name={'question-' + this.props.question.Id} id={'question-' + this.props.question.Id + "-Yes"} value="Yes" className="lqd-radio" /><label htmlFor={'question-' + this.props.question.Id + "-Yes"}>Yes</label>
          <input type="radio" name={'question-' + this.props.question.Id} id={'question-' + this.props.question.Id + "-No"} value="No" className="lqd-radio" /><label htmlFor={'question-' + this.props.question.Id + "-No"}>No</label>
        </div>
      );
    } catch (err) {
      Logger.write(`${err} - ${this.LOG_SOURCE} (render)`, LogLevel.Error);
      return null;
    }
  }
}