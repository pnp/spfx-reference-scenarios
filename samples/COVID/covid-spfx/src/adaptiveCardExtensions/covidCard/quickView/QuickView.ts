import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments } from '@microsoft/sp-adaptive-card-extension-base';

import { Logger, LogLevel } from "@pnp/logging";

import * as strings from 'CovidCardAdaptiveCardExtensionStrings';
import { find, forEach } from 'lodash';
import { CheckIns, IAnswer, ICheckIns, IQuestion, QuestionType } from '../../../webparts/covidAdmin/models/covid.model';
import { cs } from '../../../webparts/covidAdmin/services/covid.service';
import { ICovidCardAdaptiveCardExtensionProps, ICovidCardAdaptiveCardExtensionState } from '../CovidCardAdaptiveCardExtension';

export interface IQuickViewData { }

export interface IAC {
  id: string;
  type: string;
}

export interface IYesNoAnswer extends IAC {
  title: string;
  value: string;
}

export class YesNoAnswer implements IYesNoAnswer {
  constructor(
    public id: string = "",
    public title: string = "",
    public value: string = "${value}",
    public type: string = "Input.Toggle"
  ) { }
}

export interface ITextBox extends IAC {
  text: string;
  wrap: boolean;
}

export class TextBox implements ITextBox {
  constructor(
    public id: string = "",
    public text: string = "",
    public type: string = "TextBlock",
    public wrap: boolean = true
  ) { }
}

export class TextAnswer implements IAC {
  constructor(
    public id: string = "",
    public value: string = "${value}",
    public type: string = "Input.Text",
  ) { }
}

export class QuickView extends BaseAdaptiveCardView<
  ICovidCardAdaptiveCardExtensionProps,
  ICovidCardAdaptiveCardExtensionState,
  IQuickViewData
> {
  private LOG_SOURCE: string = "🔶 QuickView";
  private _questions: IQuestion[] = cs.Questions;

  public get data(): IQuickViewData {
    const answers: any = { location: "" };
    forEach(this._questions, (q) => {
      answers[`${q.Id}`] = "";
    });
    return answers;
  }

  public get template(): ISPFxAdaptiveCard {
    let template: ISPFxAdaptiveCard = require('./template/QuickViewTemplate.json');
    try {
      template.body[0].text = strings.QuickViewTitle;
      const locationOptions = cs.Locations.map((l) => { return { title: l.Title, value: l.Title }; });
      const items = [];
      items.push(new TextBox(`LabelLocation`, strings.CovidFormOfficeLabel));
      items.push({
        type: "Input.ChoiceSet",
        choices: locationOptions,
        value: "${location}",
        id: "location"
      });
      forEach(this._questions, (q) => {
        if (q.QuestionType === QuestionType.YesNo) {
          items.push(new YesNoAnswer(q.Id.toString(), q.Title, "${" + q.Id.toString() + "}"));
        } else {
          items.push(new TextBox(`Label${q.Id}`, q.Title));
          items.push(new TextAnswer(q.Id.toString(), "${" + q.Id.toString() + "}"));
        }
      });
      template.body[1].items = items;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (template) - ${err}`, LogLevel.Error);
    }
    return template;
  }

  public async onAction(action: IActionArguments): Promise<void> {
    if (action.type === 'Submit') {
      const { id, newIndex } = action.data;
      if (id === 'submit') {
        const today = new Date();
        const title = `${this.state.displayName} - ${today.toLocaleDateString()}`;
        let checkInForm: ICheckIns = new CheckIns(0, title, today, this.state.userId, null, action.data["location"], this._questions.map<IAnswer>((q) => { return { QuestionId: q.Id, Answer: action.data[q.Id.toString()] }; }), today);
        const success = await cs.addSelfCheckIn(checkInForm);
        if (success) {
          this.setState({ canCheckIn: false });
          this.quickViewNavigator.close();
        }
      } else if (id === 'cancel') {
        this.quickViewNavigator.close();
      }
    }
  }
}