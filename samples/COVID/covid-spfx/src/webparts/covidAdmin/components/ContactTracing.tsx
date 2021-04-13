import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { cloneDeep, isEqual } from "lodash";
import styles from "./CovidAdmin.module.scss";
import Persona, { Presence, Size } from "../../../common/components/molecules/Persona";
import CollapsibleTable, { ICollapsibleTable, ICollapsibleTableCell, ICollapsibleTableRow, ICollapsibleTableSection } from "../../../common/components/molecules/CollapsibleTable";
import { cs } from "../../../common/covid.service";
import { IQuery, Query } from "../../../common/covid.model";
import Button from "../../../common/components/atoms/Button";


export interface IContactTracingProps {

}

export interface IContactTracingState {


}

export class ContactTracingState implements IContactTracingState {
  constructor(

  ) { }
}

export default class ContactTracing extends React.Component<IContactTracingProps, IContactTracingState> {
  private LOG_SOURCE: string = "🔶 ContactTracing";
  private _tableHeaders: string[] = ['Name', 'Office', 'Submitted', 'Status', 'Check In Time'];

  constructor(props: IContactTracingProps) {
    super(props);
    this.state = new ContactTracingState();
  }

  public componentDidMount() {

  }

  public shouldComponentUpdate(nextProps: IContactTracingProps, nextState: IContactTracingState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _search = async (): Promise<void> => {
    try {
      let query: IQuery = new Query(new Date("4/1/2021"), new Date("4/12/2021"));
      const results = await cs.searchCheckIn(query);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_search) - ${err}`, LogLevel.Error);
    }
  }

  private _getTableData = (): ICollapsibleTable => {
    //To Do once the search is available update this.
    let tableSections: ICollapsibleTableSection[] = [];
    let tableDataRows: ICollapsibleTableRow[] = [];


    let section1Rows: ICollapsibleTableRow[] = [];


    let cells: ICollapsibleTableCell[] = [];
    let personaCell: ICollapsibleTableCell = {
      key: 0,
      className: "",
      element: React.createElement(Persona, {
        size: Size.FortyEight,
        src: "",
        showPresence: true,
        presence: Presence.PresenceUnknown,
        status: "",
        name: "Derek Cash-Peterson",
        jobTitle: "Cool Guy"
      }, "")
    };
    cells.push(personaCell);
    let officeCell: ICollapsibleTableCell = {
      key: 1,
      className: "",
      element: React.createElement('span', {}, "Medford, MA")
    };
    cells.push(officeCell);
    let submittedCell: ICollapsibleTableCell = {
      key: 2,
      className: "",
      element: React.createElement('span', {}, '4/8/2021, 2:25:08 PM')
    };
    cells.push(submittedCell);
    let checkInCell: ICollapsibleTableCell = {
      key: 3,
      className: styles.checkIn,
      element: React.createElement('span', { className: styles.isCheckedIn }, "")
    };
    cells.push(checkInCell);
    let checkInTimeCell: ICollapsibleTableCell = {
      key: 4,
      className: "",
      element: React.createElement('span', {}, "4/8/2021, 2:25:08 PM")
    };
    cells.push(checkInTimeCell);
    let section1Row1: ICollapsibleTableRow = {
      key: 0,
      cells: cells
    };

    let section1: ICollapsibleTableSection = {
      key: 0,
      sectionHeader: '4/9/2021',
      rows: [section1Row1]
    };

    tableSections.push(section1);


    return {
      headers: this._tableHeaders,
      sections: tableSections
    };
  }


  public render(): React.ReactElement<IContactTracingProps> {
    try {



      return (
        <div data-component={this.LOG_SOURCE} className={styles.covidAdmin}>
          <h1>Covid-19 Contact Tracing</h1>
          <p>You can search for a person or location and see who was checked into the building during the same time. </p>
          <div>Search Box goes Here</div>
          <div><Button className="hoo-button-primary" disabled={false} label="LoadData" onClick={this._search} /></div>
          <CollapsibleTable table={this._getTableData()}></CollapsibleTable>


        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}