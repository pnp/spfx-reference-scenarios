import { IMicrosoftTeams } from "@microsoft/sp-webpart-base";
import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import cloneDeep from "lodash-es/cloneDeep";
import isEqual from "lodash-es/isEqual";
import find from "lodash-es/find";
import isEmpty from "lodash-es/isEmpty";
import forEach from "lodash-es/forEach";

import strings from "CovidWebPartStrings";
import { cs } from "../../services/covid.service";
import { CheckInMode, IAnswer, IQuestion, ICheckIns, CheckIns } from "../../models/covid.model";
import Question from "../molecules/Question";
import Button from "../atoms/Button";
import TextBox from "../atoms/TextBox";
import DropDown, { IDropDownOption } from "../atoms/DropDown";
import Dialog from "../molecules/Dialog";

export interface ICovidFormProps {
  microsoftTeams: IMicrosoftTeams;
  checkInMode: CheckInMode;
  displayName: string;
  userId: number;
  close?: () => void;
  checkInForm?: ICheckIns;
  userCanCheckIn?: boolean;
}

export interface ICovidFormState {
  checkInForm: ICheckIns;
  dialogVisible: boolean;
  formVisible: boolean;
  errors: boolean;
}

export class CovidFormState implements ICovidFormState {
  constructor(
    public checkInForm: ICheckIns = new CheckIns(),
    public dialogVisible: boolean = false,
    public formVisible: boolean = true,
    public errors: boolean = false
  ) { }
}

export default class CovidForm extends React.Component<ICovidFormProps, ICovidFormState> {
  private LOG_SOURCE: string = "🔶CovidForm";
  private _questions: IQuestion[] = [];
  private _locationOptions: IDropDownOption[] = [];
  private _userCanCheckIn: boolean = this.props.userCanCheckIn;

  constructor(props: ICovidFormProps) {
    super(props);
    try {
      this._questions = cloneDeep(cs.Questions);
      this._locationOptions = cs.Locations.map((l) => { return { key: l.Title, text: l.Title }; });
      const today = new Date();
      const title = `${props.displayName} - ${today.toLocaleDateString()}`;
      this.state = new CovidFormState(this.props.checkInForm || new CheckIns(0, title, today, (this.props.checkInMode === CheckInMode.Self) ? this.props.userId : null, null, "", this._questions.map<IAnswer>((q) => { return { QuestionId: q.Id, Answer: "" }; }), today), false, this._userCanCheckIn);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (constructor) - ${err}`, LogLevel.Error);
    }
  }

  public shouldComponentUpdate(nextProps: ICovidFormProps, nextState: ICovidFormState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _onQuestionValueChange = (fieldValue: string, fieldName: string) => {
    try {
      const checkInForm = cloneDeep(this.state.checkInForm);
      const questionId: number = +fieldName.split("-")[1];
      let answer = find(checkInForm.QuestionsValue, { QuestionId: questionId });
      answer.Answer = fieldValue;
      this.setState({ checkInForm: checkInForm });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onQuestionValueChange) - ${err}`, LogLevel.Error);
    }
  }

  private _onTextChange = (fieldValue: string, fieldName: string) => {
    try {
      const checkInForm = cloneDeep(this.state.checkInForm);
      checkInForm[fieldName] = fieldValue;
      this.setState({ checkInForm: checkInForm });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onTextChange) - ${err}`, LogLevel.Error);
    }
  }

  private _save = async (): Promise<void> => {
    try {
      const checkInForm = cloneDeep(this.state.checkInForm);
      let errors = false;
      forEach(this._questions, (q: IQuestion) => {
        const a = find(checkInForm.QuestionsValue, { QuestionId: q.Id });

        if (isEmpty(a.Answer)) { return errors = true; }
      });
      if (isEmpty(checkInForm.CheckInOffice)) {
        errors = true;
      }

      if (!errors) {
        let success: boolean = false;
        if (this.props.checkInMode === CheckInMode.Guest) {
          checkInForm.CheckIn = new Date();
          checkInForm.CheckInById = this.props.userId;
          success = await cs.addCheckIn(checkInForm);
        } else {
          success = await cs.addSelfCheckIn(checkInForm);
        }
        if (success) {
          if (this.props.checkInMode == CheckInMode.Self) {
            this.setState({ dialogVisible: true, formVisible: false, errors: errors });
          } else {
            this.props.close();
          }
        }
      } else {
        this.setState({ errors: errors });
      }

    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_save) - ${err}`, LogLevel.Error);
    }
  }

  private _cancel = () => {
    try {
      if (this.props.checkInMode == CheckInMode.Self) {
        const checkInForm = new CheckIns();
        this.setState({ checkInForm: checkInForm });
      } else {
        this.props.close();
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_cancel) - ${err}`, LogLevel.Error);
    }
  }
  private _changeVisibility = async (visible: boolean): Promise<void> => {
    this._updateCanUserCheckIn();
    this.setState({ dialogVisible: visible });
  }

  private async _updateCanUserCheckIn() {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    localStorage.setItem("checkInDate", today.toISOString());
  }

  public render(): React.ReactElement<ICovidFormProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE}>

          <h1>{(this.props.checkInMode === CheckInMode.Guest) ? strings.AdminCheckInTitle : strings.CovidFormSelfCheckInTitle}</h1>
          <p>{(this.props.checkInMode === CheckInMode.Guest) ? strings.AdminCheckInIntro : strings.CovidFormIntro}</p>
          <p>{strings.CheckInHeader}</p>
          <div className={`form ${(this.state.formVisible) ? 'isVisibleGrid' : 'isHidden'}`}>
            <div className={`formRow error ${(this.state.errors) ? 'isVisible' : 'isHidden'}`}>
              <p>{strings.CovidFormErrors}</p>
            </div>
            {this.props.checkInMode === CheckInMode.Guest ?
              <div className='formRow'>
                <div className='textLabel'>{strings.CovidFormGuestLabel}</div>
                <TextBox name="Guest" value={this.state.checkInForm.Guest} onChange={this._onTextChange} />
              </div>
              : null}
            <div className='formRow'>
              <div className='textLabel'>{strings.CovidFormOfficeLabel}</div>
              <DropDown onChange={this._onTextChange} value={this.state.checkInForm.CheckInOffice} options={this._locationOptions} id="CheckInOffice" />
            </div>
            {this._questions?.map((q) => {
              const a = find(this.state.checkInForm.QuestionsValue, { QuestionId: q.Id });
              return (<div className='formRow'><Question question={q} answer={a} onChange={this._onQuestionValueChange} /></div>);
            })}
            <div className={`formRow buttons`} >
              <Button className="hoo-button-primary" disabled={false} label={strings.SaveLabel} onClick={this._save} />
              <Button className="hoo-button" disabled={false} label={strings.CancelLabel} onClick={this._cancel} />
            </div>
          </div>
          <div className={`${(this.state.formVisible) ? 'isHidden' : 'isVisible'}`}>
            <p>{strings.CheckInConfirmation}</p>
          </div>
          <Dialog header={strings.CheckInSuccessHeader} content={strings.CheckInSuccessContent} visible={this.state.dialogVisible} onChange={this._changeVisibility} />
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}