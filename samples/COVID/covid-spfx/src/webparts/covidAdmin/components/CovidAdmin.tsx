import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { cloneDeep, isEqual } from "lodash";
import { cs } from "../../../common/covid.service";
import { ICheckIns, CheckInMode } from "../../../common/covid.model";
import CovidForm from "../../../common/components/CovidForm";
import styles from "./CovidAdmin.module.scss";
import PivotBar, { IPivotBarOption } from "../../../common/components/atoms/PivotBar";
import DatePicker from "../../../common/components/molecules/DatePicker";
import Persona, { Presence } from "../../../common/components/molecules/Persona";
import ButtonIcon from "../../../common/components/atoms/ButtonIcon";
import { Icons } from "../../../common/enums";
import { Size } from "../../../common/components/atoms/Avatar";
import CovidAdministration from "./CovidAdministration";
import { IMicrosoftTeams } from "@microsoft/sp-webpart-base";

export enum ADMINTABS {
  "TODAY",
  "GUEST",
  "CONTACTTRACING",
  "ADMINISTRATION"
}
export interface ICovidAdminProps {
  microsoftTeams: IMicrosoftTeams;
  loginName: string;
  displayName: string;
  userId: number;
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
      text: "Today", active: true, onClick: () => this._changeTab(ADMINTABS.TODAY)
    },
    {
      text: "Register Guest", active: false, onClick: () => this._changeTab(ADMINTABS.GUEST)
    },
    {
      text: "Contact Tracing", active: false, onClick: () => this._changeTab(ADMINTABS.CONTACTTRACING)
    },
    {
      text: "Administration", active: false, onClick: () => this._changeTab(ADMINTABS.ADMINISTRATION)
    }];

  constructor(props: ICovidAdminProps) {
    super(props);
    this.state = new CovidAdminState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ICovidAdminProps>, nextState: Readonly<ICovidAdminState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public componentDidMount() {
    const checkIns = cloneDeep(cs.CheckIns);
    this.setState({ checkIns: checkIns });
    cs.CheckInsRefresh = this._updateCheckIns;
  }

  private _updateCheckIns = (selectedDate: Date) => {
    const checkIns = cloneDeep(cs.CheckIns);
    this.setState({ checkIns: checkIns, selectedDate: selectedDate });
  }

  private _changeTab = (newTab: ADMINTABS): void => {
    this.setState({ tab: newTab });
  }


  private _changeDate = (dateOffset: number) => {
    try {
      const selectedDate = cloneDeep(this.state.selectedDate);
      selectedDate.setDate(selectedDate.getDate() + dateOffset);
      cs.getCheckIns(selectedDate);
      this.setState({ selectedDate: selectedDate });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_changeDate) - ${err}`, LogLevel.Error);
    }
  }
  private _checkInPerson = (checkIn: ICheckIns) => {
    try {
      checkIn.CheckInById = this.props.userId;
      checkIn.CheckIn = new Date();
      cs.adminCheckIn(checkIn);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_changeDate) - ${err}`, LogLevel.Error);
    }
  }

  private _closeGuestForm = () => {
    this.setState({ tab: ADMINTABS.TODAY });
    const selectedDate = cloneDeep(this.state.selectedDate);
    cs.getCheckIns(selectedDate);
  }

  public render(): React.ReactElement<ICovidAdminProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className={styles.covidAdmin}>

          <PivotBar options={this._tabOptions} />
          {this.state.tab === ADMINTABS.TODAY &&
            <>
              <h1>Check-In Covid-19</h1>
              <p>As people enter the building please check this Covid check-In page to ensure that they have completed their self
    attestation. For guests please fill out the form for them. using the link below.</p>
              <DatePicker selectedDate={this.state.selectedDate} onDateChange={this._changeDate} />

              <table className="lqd-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Office</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Checked In</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.checkIns?.map((ci) => {
                    return (
                      //TODO: add loading="lazy" to image
                      //"https://pbs.twimg.com/profile_images/1238648419415187457/53YpWGZ4_400x400.jpg"
                      <tr key={ci.Id}>
                        <td>
                          <Persona
                            size={Size.FortyEight}
                            src={ci.Employee?.PhotoBlobUrl}
                            showPresence={true}
                            presence={Presence[ci.Employee?.Presence.activity]}
                            status={ci.Employee?.Presence.availability}
                            name={ci.Employee?.Title || ci.Guest}
                            jobTitle={(ci.Employee) ? ci.Employee.JobTitle : "Guest"} />
                        </td>
                        <td>{ci.CheckInOffice}</td>
                        <td>{ci.SubmittedOn?.toLocaleString() || ci.Created?.toLocaleString()}</td>
                        <td className={styles.checkIn}><span className={`${(ci.CheckIn) ? styles.isCheckedIn : styles.isNotCheckedIn}`}></span></td>
                        <td>{ci.CheckIn?.toLocaleString()}</td>
                        <td><ButtonIcon iconType={Icons.Check} onClick={() => this._checkInPerson(ci)} /></td>
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
                    <th></th>
                  </tr>
                </tfoot>
              </table>
            </>

          }
          {this.state.tab === ADMINTABS.GUEST &&
            <CovidForm microsoftTeams={this.props.microsoftTeams} displayName="Guest" checkInMode={CheckInMode.Guest} close={this._closeGuestForm} />
          }
          {this.state.tab === ADMINTABS.CONTACTTRACING &&
            <div>Contact Tracing goes here</div>
          }
          {this.state.tab === ADMINTABS.ADMINISTRATION &&
            <CovidAdministration />
          }
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}