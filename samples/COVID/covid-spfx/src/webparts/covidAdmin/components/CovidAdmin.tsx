import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { cloneDeep, isEqual } from "lodash";
import { cs } from "../../../common/covid.service";
import { ICheckIns, CheckInMode } from "../../../common/covid.model";
import CovidForm from "../../../common/components/CovidForm";
import styles from "./CovidAdmin.module.scss";
import PivotBar, { IPivotBarOption } from "../../../common/components/atoms/PivotBar";
import DatePicker from "../../../common/components/molecules/DatePicker";

export enum ADMINTABS {
  "TODAY",
  "GUEST"
}
export interface ICovidAdminProps {
  loginName: string;
  displayName: string;
  userId?: number;
}

export interface ICovidAdminState {
  tab: ADMINTABS;
  checkIns: ICheckIns[];
  selectedDate: Date;
}

export class CovidAdminState implements ICovidAdminState {
  constructor(
    public checkIns: ICheckIns[] = [],
    public tab: ADMINTABS = ADMINTABS.TODAY,
    public selectedDate: Date = new Date()
  ) { }
}

export default class CovidAdmin extends React.Component<ICovidAdminProps, ICovidAdminState> {
  private LOG_SOURCE: string = "🔶 CovidAdmin";
  //Set up the tabs for the PivotBar
  private _tabOptions: IPivotBarOption[] = [
    {
      key: 0, text: "Today", active: true, onClick: () => this._changeTab(ADMINTABS.TODAY)
    },
    {
      key: 1, text: "Register Guest", active: false, onClick: () => this._changeTab(ADMINTABS.GUEST)
    }];

  constructor(props: ICovidAdminProps) {
    super(props);
    this.state = new CovidAdminState();
  }

  public componentDidMount() {
    this.setState({ checkIns: cs.CheckIns });
    cs.CheckInsRefresh = this._updateCheckIns;
  }

  public shouldComponentUpdate(nextProps: ICovidAdminProps, nextState: ICovidAdminState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _updateCheckIns = () => {
    this.setState({ checkIns: cs.CheckIns });
  }

  private _changeTab = (newTab: ADMINTABS): void => {
    this.setState({ tab: newTab });
  }

  private _changeDate = (dateOffset: number) => {
    try {
      const selectedDate = cloneDeep(this.state.selectedDate);
      selectedDate.setDate(selectedDate.getDate() + dateOffset);
      this.setState({ selectedDate: selectedDate });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_changeDate) - ${err}`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<ICovidAdminProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className={styles.covidAdmin}>
          <h1>Check-In Covid-19</h1>
          <p>As people enter the building please check this Covid check-In page to ensure that they have completed their self
    attestation. For guests please fill out the form for them. using the link below.</p>
          <PivotBar options={this._tabOptions} />


          {this.state.tab === ADMINTABS.TODAY &&
            <>
              <DatePicker selectedDate={this.state.selectedDate} onDateChange={this._changeDate} />
              <table className="lqd-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Office</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Checked In</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.checkIns.map((ci) => {
                    return (
                      //TODO: add loading="lazy" to image
                      <tr key={ci.Id}>
                        <td>
                          <div className="lqd-persona">
                            <div className="lqd-avatar-pres">
                              <div className="lqd-avatar">

                                <img src="../../../images/mug-shots/female-mugshot-001.jpg" alt="" className="lqd-avatar" />
                              </div>
                              <div className="lqd-presence is-dnd" title="Online"></div>
                            </div>
                            <div className="lqd-persona-data">
                              <div className="lqd-persona-name">{ci.Employee?.Title || ci.Guest}</div>
                              //<div className="lqd-persona-function"><span>Lead Fluent Designer</span></div>
                              //<div className="lqd-persona-statustext"><span>In a meeting</span></div>
                              //<div className="lqd-persona-available"><span>Call me yesterday</span></div>
                            </div>
                          </div>
                        </td>
                        <td>{ci.CheckInOffice}</td>
                        <td>{ci.SubmittedOn || ci.Created}</td>
                        <td>status</td>
                        <td>{ci.CheckIn}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <th>Name</th>
                    <th>Office</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Checked In</th>
                  </tr>
                </tfoot>
              </table>
            </>

          }
          {this.state.tab === ADMINTABS.GUEST &&
            <CovidForm loginName={this.props.loginName} displayName={this.props.displayName} userId={this.props.userId} checkInMode={CheckInMode.Guest} />
          }
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}