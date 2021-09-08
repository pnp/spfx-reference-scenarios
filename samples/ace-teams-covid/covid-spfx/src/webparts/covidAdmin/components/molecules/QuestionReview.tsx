import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import { cloneDeep } from "@microsoft/sp-lodash-subset";
import { isEqual } from "@microsoft/sp-lodash-subset";
import { find } from "@microsoft/sp-lodash-subset";

import strings from "CovidWebPartStrings";
import { ICheckIns, IQuestion } from "../../models/covid.model";
import { cs } from "../../services/covid.service";
import Button from "../atoms/Button";


export interface IQuestionReviewProps {
  checkIn: ICheckIns;
  save: (checkIn: ICheckIns) => void;
  cancel: () => void;
}

export interface IQuestionReviewState { }

export class QuestionReviewState implements IQuestionReviewState {
  constructor() { }
}

export default class QuestionReview extends React.Component<IQuestionReviewProps, IQuestionReviewState> {
  private LOG_SOURCE: string = "🔶QuestionReview";
  private _questions: IQuestion[] = [];


  constructor(props: IQuestionReviewProps) {
    super(props);
    this._questions = cloneDeep(cs.Questions);
    this.state = new QuestionReviewState();
  }

  public shouldComponentUpdate(nextProps: IQuestionReviewProps, nextState: IQuestionReviewState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IQuestionReviewProps> {
    try {
      let name: string;
      if (this.props.checkIn.Employee) {
        name = this.props.checkIn.Employee.Title;
      } else {
        name = `${this.props.checkIn.Guest} (${strings.CovidFormGuestValue})`;
      }

      return (
        <div data-component={this.LOG_SOURCE} className={`componentGrid dialog`}>
          <div>
            <span className="textLabel">{strings.CovidFormNameLabel}: </span>{name}
          </div>
          <div>
            <span className="textLabel">{strings.CovidFormOfficeLabel}: </span>{this.props.checkIn.CheckInOffice}
          </div>
          {this._questions.map((q) => {
            const a = find(this.props.checkIn.QuestionsValue, { QuestionId: q.Id });
            return (<div><span className="textLabel">{q.Title}: </span>{a?.Answer || "Not Answered"}</div>);
          })}
          <div className="buttons" >
            <Button className="hoo-button-primary" disabled={false} label={strings.CheckInLabel} onClick={() => { this.props.save(this.props.checkIn); }} />
            <Button className="hoo-button" disabled={false} label={strings.CancelLabel} onClick={() => { this.props.cancel(); }} />
          </div>
        </div>

      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}