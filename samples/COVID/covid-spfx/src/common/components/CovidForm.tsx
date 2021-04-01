import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual, find, cloneDeep } from "lodash";

import styles from './CovidForm.module.scss';
import Question from "./molecules/Question";
import { CheckInMode, IAnswer, ILocations, IQuestion } from "../covid.model";
import Button from "./atoms/Button";
import TextBox from "./atoms/TextBox";
import DropDown, { IDropDownOption } from "./atoms/DropDown";

export interface ICovidFormProps {
  questions: IQuestion[];
  locations: ILocations[];
  answers: IAnswer[];
  checkInMode: CheckInMode;
}

export interface ICovidFormState {
  answers: IAnswer[];
  checkInOffice: string;
  guest: string;
}

export class CovidFormState implements ICovidFormState {
  constructor(
    public answers: IAnswer[] = [],
    public checkInOffice: string = "",
    public guest: string = ""
  ) { }
}

export default class CovidForm extends React.Component<ICovidFormProps, ICovidFormState> {
  private LOG_SOURCE: string = "🔶CovidForm";
  private _locationOptions: IDropDownOption[] = [];

  constructor(props: ICovidFormProps) {
    super(props);
    this.state = new CovidFormState(this.props.answers);
    this._locationOptions = props.locations.map((l) => { return { key: l.Title, text: l.Title }; });
  }

  public shouldComponentUpdate(nextProps: ICovidFormProps, nextState: ICovidFormState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _onQuestionValueChange = (fieldValue: string, fieldName: string) => {
    try {
      let answers = cloneDeep(this.state.answers);
      const questionId: number = +fieldName.split("-")[1];
      let answer = find(answers, { QuestionId: questionId });
      answer.Answer = fieldValue;
      this.setState({ answers: answers });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onQuestionValueChange) - ${err}`, LogLevel.Error);
    }
  }

  private _onTextChange = (fieldValue: string, fieldName: string) => {
    try {
      let state = {};
      state[fieldName] = fieldValue;
      this.setState(state);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onTextChange) - ${err}`, LogLevel.Error);
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
            <div className={styles.formBody}>
              {this.props.checkInMode === CheckInMode.Guest ?
                <div className={styles.formRow}>
                  <div className={styles.question}>Guest Name</div>
                  <TextBox name="guest" value={this.state.guest} onChange={this._onTextChange} />
                </div>
                : null}
              <div className={styles.formRow}>
                <div className={styles.question}>Office</div>
                <DropDown onChange={this._onTextChange} value={this.state.checkInOffice} options={this._locationOptions} id="checkInOffice" />
              </div>
              {this.props.questions?.map((q) => {
                const a = find(this.state.answers, { QuestionId: q.Id });
                return (<Question question={q} answer={a} onChange={this._onQuestionValueChange} />);
              })}
              <div className={`${styles.formRow} ${styles.buttonRow}`} >
                <Button className="lqd-button-primary" disabled={false} label="Save" onClick={() => { }} />
                <Button className="lqd-button" disabled={false} label="Cancel" onClick={() => { }} />
              </div>
            </div>
          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}