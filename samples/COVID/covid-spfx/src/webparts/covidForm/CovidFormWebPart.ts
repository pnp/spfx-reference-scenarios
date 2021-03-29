import * as React from 'react';
import * as ReactDom from 'react-dom';

import { sp } from "@pnp/sp";
import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";

import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'CovidFormWebPartStrings';
import CovidForm, { ICovidFormProps } from './components/CovidForm';
import { cs } from '../../common/covid.service';
import { IAnswer, ILocations, IQuestion } from '../../common/covid.model';


export interface ICovidFormWebPartProps {
  notifications: string;
}

export default class CovidFormWebPart extends BaseClientSideWebPart<ICovidFormWebPartProps> {
  private _questions: IQuestion[] = [];
  private _locations: ILocations[] = [];
  private _answers: IAnswer[] = [];


  public async onInit(): Promise<void> {
    //Initialize PnPLogger
    Logger.subscribe(new ConsoleListener());
    Logger.activeLogLevel = LogLevel.Info;

    //Initialize PnPJs
    sp.setup({ spfxContext: this.context });

    await cs.init();
    if (cs.Ready) {
      this._questions = cs.Questions;
      this._locations = cs.Locations;
      this._buildAnswerArray();
    }
  }

  private _buildAnswerArray() {
    this._questions.map((q) => {
      return this._answers.push({
        QuestionId: q.Id,
        Answer: ""
      });
    });
  }

  public render(): void {
    const element: React.ReactElement<ICovidFormProps> = React.createElement(
      CovidForm,
      {
        questions: this._questions,
        locations: this._locations,
        answers: this._answers
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
