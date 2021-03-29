import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "lodash";
import styles from './CovidForm.module.scss';
import Question from "./molecules/Question";
import { IAnswer, ILocations, IQuestion } from "../../../common/covid.model";
import Button from "./atoms/Button";


export interface ICovidFormProps {
  questions: IQuestion[];
  locations: ILocations[];
  answers: IAnswer[];
}

export interface ICovidFormState {
  answers: IAnswer[];
}

export class CovidFormState implements ICovidFormState {
  constructor(
    public answers: IAnswer[] = []
  ) { }
}

export default class CovidForm extends React.Component<ICovidFormProps, ICovidFormState> {
  private LOG_SOURCE: string = "CovidForm";

  constructor(props: ICovidFormProps) {
    super(props);
    this.state = new CovidFormState(this.props.answers);
    this._onValueChange = this._onValueChange.bind(this);
  }

  public shouldComponentUpdate(nextProps: ICovidFormProps, nextState: ICovidFormState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _onValueChange(fieldValue: string, questionID: number) {
    try {
      let answers = this.state.answers;
      let index = answers.map(a => a.QuestionId).indexOf(questionID);
      answers[index] = { QuestionId: questionID, Answer: fieldValue };
      this.setState({ answers })
    } catch (err) {
      Logger.write(`${err} - ${this.LOG_SOURCE} (_onValueChange)`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<ICovidFormProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className={styles.covidForm}>
          <div className="form">
            <h1>Covid-19 Employee Self-Attestation Form</h1>
            <p>As on-site work resumes, all employees must complete a Covid-19 self attestation form each day before they enter
            the building. This requirement applies to all employees, contractors, visitors, or temporary employees.</p>
            <p>In the last 72 hours have you experienced any of the following symptoms that are not attributed to another illness?</p>
            <div className="formBody">
              {this.props.questions ? this.props.questions.map(q => (
                <div className={styles.formRow}>
                  <Question question={q} onChange={this._onValueChange} />
                </div>
              )) : null}
              <div className={styles.formRow + ' ' + styles.buttonRow} >
                <Button className="lqd-button-primary" disabled={false} label="Save" />
                <Button className="lqd-button" disabled={false} label="Cancel" />
              </div>
            </div>
          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`${err} - ${this.LOG_SOURCE} (render)`, LogLevel.Error);
      return null;
    }
  }
}