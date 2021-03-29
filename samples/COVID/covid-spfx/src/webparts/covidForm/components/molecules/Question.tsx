import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "lodash";
import styles from '../CovidForm.module.scss';
import { IQuestion, QuestionType } from "../../../../common/covid.model";
import TextBox from "../atoms/TextBox";
import RadioButton from "../atoms/RadioButton";

export interface IQuestionProps {
  question: IQuestion;
  onChange: (fieldName: string, questionID: number) => void;
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
        <>
          <div className={styles.question}>{this.props.question.Title}</div>
          {this.props.question.QuestionType === QuestionType.YesNo ? <RadioButton question={this.props.question} onChange={this.props.onChange} /> : <TextBox question={this.props.question} onChange={this.props.onChange} />}
        </>
      );
    } catch (err) {
      Logger.write(`${err} - ${this.LOG_SOURCE} (render)`, LogLevel.Error);
      return null;
    }
  }
}