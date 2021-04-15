import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { cloneDeep, isEqual } from "lodash";
import { cs } from "../../../common/covid.service";
import styles from "./CovidAdmin.module.scss";
import Dialog from "../../../common/components/molecules/Dialog";
import Button from "../../../common/components/atoms/Button";

export enum DIALOGS {
  "LOCATIONS",
  "QUESTIONS"
}
export interface ICovidAdministrationProps {

}

export interface ICovidAdministrationState {
  locationsVisible: boolean;
  questionsVisible: boolean;


}

export class CovidAdministrationState implements ICovidAdministrationState {
  constructor(
    public locationsVisible: boolean = false,
    public questionsVisible: boolean = false
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

  private _changeLocationVisibility = async (visible: boolean): Promise<void> => {
    this.setState({ locationsVisible: visible });
    // if (visible) {
    //   this.setState({ questionsVisible: false });
    // }
  }
  private _changeQuestionsVisibility = async (visible: boolean): Promise<void> => {
    this.setState({ questionsVisible: visible });
    // if (visible) {
    //   this.setState({ locationsVisible: false });
    // }
  }


  public render(): React.ReactElement<ICovidAdministrationProps> {
    try {


      const styleBlock = { "height": `70vh`, "width": `56vw` } as React.CSSProperties;
      return (
        <div data-component={this.LOG_SOURCE} className={styles.covidAdmin}>
          <h1>Covid-19 Application Administration</h1>
          <p>From here you can manage the questions and locations for the application. This data is stored in SharePoint lists. </p>
          <div className={`${styles.formRow} ${styles.buttons}`}>
            <Button label="Manage Locations" className="hoo-button-primary" disabled={false} onClick={() => { this._changeLocationVisibility(true); }} />
            <Button label="Manage Questions" className="hoo-button-primary" disabled={false} onClick={() => { this._changeQuestionsVisibility(true); }} />
            <Dialog header="Manage Locations" content="" visible={this.state.locationsVisible} onChange={this._changeLocationVisibility} width={60} height={80}>
              <iframe src="https://julieturner.sharepoint.com/sites/TeamsSamples/Lists/CheckInLocations/AllItems.aspx" style={styleBlock} />
            </Dialog>
            <Dialog header="Manage Questions" content="" visible={this.state.questionsVisible} onChange={this._changeQuestionsVisibility} width={60} height={80}>
              <iframe src="https://julieturner.sharepoint.com/sites/TeamsSamples/Lists/CheckInQuestions/AllItems.aspx" style={styleBlock} />
            </Dialog>

          </div>


        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}