import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";

import strings from "CovidWebPartStrings";
import { cs } from "../../services/covid.service";

export interface ICovidAdministrationProps { }

export interface ICovidAdministrationState { }

export class CovidAdministrationState implements ICovidAdministrationState {
  constructor(

  ) { }
}

export default class CovidAdministration extends React.Component<ICovidAdministrationProps, ICovidAdministrationState> {
  private LOG_SOURCE: string = "🔶CovidAdministration";

  constructor(props: ICovidAdministrationProps) {
    super(props);
    this.state = new CovidAdministrationState();
  }

  public shouldComponentUpdate(nextProps: ICovidAdministrationProps, nextState: ICovidAdministrationState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ICovidAdministrationProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE}>
          <h1>{strings.AdministrationHeader}</h1>
          <p>{strings.AdministrationSubHeader}</p>
          <div>
            <ul>
              <li><a href={cs.LocationListUrl}>{strings.ManageLocations}</a></li>
              <li><a href={cs.QuestionListUrl}>{strings.ManageQuestions}</a></li>
            </ul>
          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}