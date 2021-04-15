import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { cloneDeep, isEqual } from "lodash";
import { cs } from "../../../common/covid.service";
import styles from "./CovidAdmin.module.scss";

export interface ICovidAdministrationProps {

}

export interface ICovidAdministrationState {


}

export class CovidAdministrationState implements ICovidAdministrationState {
  constructor(

  ) { }
}

export default class CovidAdministration extends React.Component<ICovidAdministrationProps, ICovidAdministrationState> {
  private LOG_SOURCE: string = "🔶 CovidAdministration";

  constructor(props: ICovidAdministrationProps) {
    super(props);
    this.state = new CovidAdministrationState();
  }

  public componentDidMount() {

  }

  public shouldComponentUpdate(nextProps: ICovidAdministrationProps, nextState: ICovidAdministrationState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }


  public render(): React.ReactElement<ICovidAdministrationProps> {
    try {



      return (
        <div data-component={this.LOG_SOURCE} className={styles.covidAdmin}>
          <h1>Covid-19 Application Administration</h1>
          <p>From here you can manage the questions and locations for the application. This data is stored in SharePoint lists. </p>
          <div>
            <ul>
              <li><a href="https://julieturner.sharepoint.com/sites/TeamsSamples/Lists/CheckInLocations/AllItems.aspx">Manage Locations</a></li>
              <li><a href="https://julieturner.sharepoint.com/sites/TeamsSamples/Lists/CheckInQuestions/AllItems.aspx">Manage Questions</a></li>
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