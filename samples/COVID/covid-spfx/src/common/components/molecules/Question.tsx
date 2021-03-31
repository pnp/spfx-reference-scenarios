import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "lodash";
import styles from '../CovidForm.module.scss';
import { IQuestion, QuestionType, IAnswer } from "../../covid.model";
import TextBox from "../atoms/TextBox";
import RadioButton from "../atoms/RadioButton";

export interface IQuestionProps {
  question: IQuestion;
  answer: IAnswer;
  onChange: (fieldValue: string, fieldName: string) => void;
}

export interface IQuestionState {
}

export class QuestionState implements IQuestionState {
  constructor() { }
}

export default class Question extends React.Component<IQuestionProps, IQuestionState> {
  private LOG_SOURCE: string = "Question";

  constructor(props: IQuestionProps) {
    super(props);
    this.state = new QuestionState();
  }

  public shouldComponentUpdate(nextProps: IQuestionProps, nextState: IQuestionState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  //To Do We should probably switch QuestionType in the model to reference the Enum. 
  public render(): React.ReactElement<IQuestionProps> {
    try {

      return (
        <div data-component={this.LOG_SOURCE} key={this.props.question.Id}>
          <div className={styles.question}>{this.props.question.Title}</div>
          {this.props.question.QuestionType === QuestionType.YesNo ?
            <RadioButton name={`question-${this.props.question.Id}`} value={this.props.answer.Answer} onChange={this.props.onChange} /> :
            <TextBox name={`question-${this.props.question.Id}`} value={this.props.answer.Answer} onChange={this.props.onChange} />
          }
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}