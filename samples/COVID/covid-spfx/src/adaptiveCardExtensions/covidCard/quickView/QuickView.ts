import { ISPFxAdaptiveCard, BaseAdaptiveCardView } from '@microsoft/sp-adaptive-card-extension-base';

import { Logger, LogLevel } from "@pnp/logging";

import * as strings from 'CovidCardAdaptiveCardExtensionStrings';
import { forEach } from 'lodash';
import { IQuestion, QuestionType } from '../../../webparts/covidAdmin/models/covid.model';
import { cs } from '../../../webparts/covidAdmin/services/covid.service';
import { ICovidCardAdaptiveCardExtensionProps, ICovidCardAdaptiveCardExtensionState } from '../CovidCardAdaptiveCardExtension';

export interface IQuickViewData { }

export interface IAC {
  id: string;
  type: string;
}

export interface IYesNoAnswer extends IAC {
  title: string;
}

export class YesNoAnswer implements IYesNoAnswer {
  constructor(
    public id: string = "",
    public title: string = "",
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
    public type: string = "Input.Text",
  ) { }
}

export class QuickView extends BaseAdaptiveCardView<
  ICovidCardAdaptiveCardExtensionProps,
  ICovidCardAdaptiveCardExtensionState,
  IQuickViewData
> {
  private LOG_SOURCE: string = "🔶 QuickView";

  public get data(): IQuickViewData {
    return {};
  }

  public get template(): ISPFxAdaptiveCard {
    let template: ISPFxAdaptiveCard = require('./template/QuickViewTemplate.json');
    try {
      template.body[0].text = strings.QuickViewTitle;
      const questions: IQuestion[] = cs.Questions;
      const items = [];
      forEach(questions, (q) => {
        if (q.QuestionType === QuestionType.YesNo) {
          items.push(new YesNoAnswer(q.Id.toString(), q.Title));
        } else {
          items.push(new TextBox(`Label${q.Id}`, q.Title));
          items.push(new TextAnswer(q.Id.toString()));
        }
      });
      template.body[1].items = items;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (template) - ${err}`, LogLevel.Error);
    }
    return template;
  }
}