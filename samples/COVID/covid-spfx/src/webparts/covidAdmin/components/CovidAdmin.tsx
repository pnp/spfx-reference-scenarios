import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { cloneDeep, isEqual } from "lodash";
import { cs } from "../../../common/covid.service";
import { ICheckIns, CheckInMode, ADMINTABS } from "../../../common/covid.model";
import CovidForm from "../../../common/components/CovidForm";
import styles from "./CovidAdmin.module.scss";
import DatePicker from "../../../common/components/molecules/DatePicker";
import Persona, { Presence } from "../../../common/components/molecules/Persona";
import ButtonIcon from "../../../common/components/atoms/ButtonIcon";
import { Icons } from "../../../common/enums";
import { Size } from "../../../common/components/molecules/Persona";
import CovidAdministration from "./CovidAdministration";
import { IMicrosoftTeams } from "@microsoft/sp-webpart-base";
import Table, { ITable, ITableCell, ITableRow } from "../../../common/components/molecules/Table";
import ContactTracing from "./ContactTracing";
import Today from "./molecules/Today";
import PivotBar, { IPivotBarOption } from "./atoms/PivotBar";

export interface ICovidAdminProps {
  microsoftTeams: IMicrosoftTeams;
  loginName: string;
  displayName: string;
  userId: number;
  userCanCheckIn: boolean;
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
  private _tableHeaders: string[] = ['Name', 'Office', 'Submitted', 'Check In Status', 'Check In Time', ''];
  private _tableFooters: string[] = ['Name', 'Office', 'Submitted', 'Check In Status', 'Check In Time', ''];

  //Set up the tabs for the PivotBar
  private _tabOptions: IPivotBarOption[] = [
    {
      key: ADMINTABS.TODAY,
      displayName: "Today"
    },
    {
      key: ADMINTABS.GUEST,
      displayName: "Register Guest"
    },
    {
      key: ADMINTABS.CONTACTTRACING,
      displayName: "Contact Tracing"
    },
    {
      key: ADMINTABS.ADMINISTRATION,
      displayName: "Administration"
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
          {cs.IsAdmin &&
            <>
              <PivotBar options={this._tabOptions} onClick={this._changeTab} activeTab={this.state.tab} />
              {this.state.tab == ADMINTABS.SELFCHECKIN &&
                <CovidForm microsoftTeams={this.props.microsoftTeams} checkInMode={CheckInMode.Self} displayName={this.props.displayName} userId={this.props.userId} userCanCheckIn={this.props.userCanCheckIn} />
              }
              {this.state.tab === ADMINTABS.TODAY &&
                <>
                  <h1>Check-In Covid-19</h1>
                  <p>As people enter the building please check this Covid check-In page to ensure that they have completed their self
    attestation. For guests please fill out the form for them. using the link below.</p>
                  <DatePicker selectedDate={this.state.selectedDate} onDateChange={this._changeDate} />
                  <Today data={this.state.checkIns} />
                </>
              }
              {this.state.tab === ADMINTABS.GUEST &&
                <CovidForm microsoftTeams={this.props.microsoftTeams} displayName="Guest" checkInMode={CheckInMode.Guest} close={this._closeGuestForm} />
              }
              {this.state.tab === ADMINTABS.CONTACTTRACING &&
                <ContactTracing />
              }
              {this.state.tab === ADMINTABS.ADMINISTRATION &&
                <CovidAdministration />
              }
            </>
          }
          {!cs.IsAdmin &&
            <CovidForm microsoftTeams={this.props.microsoftTeams} checkInMode={CheckInMode.Self} displayName={this.props.displayName} userId={this.props.userId} userCanCheckIn={this.props.userCanCheckIn} />
          }
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}