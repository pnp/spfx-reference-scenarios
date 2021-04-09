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
import Table, { ITable, ITableCell, ITableRow } from "../../../common/components/molecules/Table";

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
  private _tableHeaders: string[] = ['Name', 'Office', 'Submitted', 'Status', 'Check In Time', ''];
  private _tableFooters: string[] = ['Name', 'Office', 'Submitted', 'Status', 'Check In Time', ''];
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

  private _getTableData = (checkIns: ICheckIns[]): ITable => {
    let tableDataRows: ITableRow[] = [];
    checkIns?.map((ci, index) => {
      let cells: ITableCell[] = [];
      let personaCell: ITableCell = {
        key: 0,
        className: "",
        element: React.createElement(Persona, {
          size: Size.FortyEight,
          src: (ci.Employee) ? ci.Employee.PhotoBlobUrl : "",
          showPresence: true,
          presence: (ci.Employee) ? Presence[ci.Employee.Presence.activity] : Presence.PresenceUnknown,
          status: (ci.Employee) ? ci.Employee.Presence.availability : "",
          name: ci.Employee?.Title || ci.Guest,
          jobTitle: (ci.Employee) ? ci.Employee.JobTitle : "Guest"
        }, "")
      };
      cells.push(personaCell);
      let officeCell: ITableCell = {
        key: 1,
        className: "",
        element: React.createElement('span', {}, ci.CheckInOffice)
      };
      cells.push(officeCell);
      let submittedCell: ITableCell = {
        key: 2,
        className: "",
        element: React.createElement('span', {}, new Date(ci.SubmittedOn?.toString()).toLocaleString() || new Date(ci.Created?.toString()).toLocaleString())
      };
      cells.push(submittedCell);
      let checkInCell: ITableCell = {
        key: 3,
        className: styles.checkIn,
        element: React.createElement('span', { className: (ci.CheckIn) ? styles.isCheckedIn : styles.isNotCheckedIn }, "")
      };
      cells.push(checkInCell);
      let checkInTimeCell: ITableCell = {
        key: 4,
        className: "",
        element: React.createElement('span', {}, ci.CheckIn?.toLocaleString())
      };
      cells.push(checkInTimeCell);
      let checkInButtonCell: ITableCell = {
        key: 5,
        className: "",
        element: (ci.CheckIn) ? React.createElement('span', {}, "") : React.createElement(ButtonIcon, { iconType: Icons.Check, onClick: () => this._checkInPerson(ci) }, "")
      };
      cells.push(checkInButtonCell);
      return (
        tableDataRows.push({ key: index, className: "", cells: cells })
      );
    });

    return {
      headers: this._tableHeaders,
      footers: this._tableFooters,
      dataRows: tableDataRows
    };
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
              <Table table={this._getTableData(this.state.checkIns)} />
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