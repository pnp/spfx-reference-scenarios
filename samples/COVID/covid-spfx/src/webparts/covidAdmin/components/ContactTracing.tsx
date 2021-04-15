import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { cloneDeep, isEqual, Dictionary, find, includes } from "lodash";
import styles from "./CovidAdmin.module.scss";
import Persona, { Presence, Size } from "../../../common/components/molecules/Persona";
import CollapsibleTable, { ICollapsibleTable, ICollapsibleTableCell, ICollapsibleTableRow, ICollapsibleTableSection } from "../../../common/components/molecules/CollapsibleTable";
import { cs } from "../../../common/covid.service";
import { IQuery, Query, ICheckIns } from "../../../common/covid.model";
import Button from "../../../common/components/atoms/Button";
import TableHeader from "./atoms/TableHeader";
import TableSectionHeader from "./atoms/TableSectionHeader";
import TableSection from "./atoms/TableSection";


export interface IContactTracingProps {

}

export interface IContactTracingState {
  allExpanded: boolean;
  searchResults: Dictionary<ICheckIns[]>;
  sectionExpanded: { section: string, expanded: boolean; }[];
}

export class ContactTracingState implements IContactTracingState {
  constructor(
    public allExpanded: boolean = true,
    public searchResults: Dictionary<ICheckIns[]> = null,
    public sectionExpanded: { section: string, expanded: boolean; }[] = []
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
      const searchResults = await cs.searchCheckIn(query);
      const sectionExpanded = (searchResults != null) ? Object.getOwnPropertyNames(searchResults).map((section) => { return { section: section, expanded: true }; }) : [];
      this.setState({ searchResults, sectionExpanded });
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

  private expandEvent(sectionName: string): void {
    try {
      let allExpanded = this.state.allExpanded;
      const sectionExpanded = cloneDeep(this.state.sectionExpanded);
      if (sectionName == "All") {
        allExpanded = !allExpanded;
        sectionExpanded.forEach((o) => { o.expanded = allExpanded; });
      } else {
        const se = find(sectionExpanded, { section: sectionName });
        se.expanded = !se.expanded;
      }
      this.setState({ allExpanded, sectionExpanded });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (expandEvent) - ${err} - `, LogLevel.Error);
    }
  }


  public render(): React.ReactElement<IContactTracingProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className={styles.covidAdmin}>
          <h1>Covid-19 Contact Tracing</h1>
          <p>You can search for a person or location and see who was checked into the building during the same time. </p>
          <div>Search Box goes Here</div>
          <div>
            <Button className="hoo-button-primary" disabled={false} label="LoadData" onClick={this._search} />
            <Button className="hoo-button-primary" disabled={false} label="GetSiteUsers" onClick={() => cs.getSiteUsers()} />
          </div>
          {/* <CollapsibleTable table={this._getTableData()}></CollapsibleTable> */}
          {this.state.searchResults &&
            <table className="hoo-table is-collapsable">
              <TableHeader columnNames={this._tableHeaders} expanded={this.state.allExpanded} expandClick={() => this.expandEvent("All")} />
              <tbody>
                {Object.getOwnPropertyNames(this.state.searchResults).map((result) => {
                  const expanded = find(this.state.sectionExpanded, { section: result })?.expanded || false;
                  return (
                    <>
                      <TableSectionHeader
                        sectionName={result}
                        colSpan={5}
                        sectionHeader={result}
                        expanded={expanded}
                        expandClick={() => { this.expandEvent(result); }}
                      />
                      <TableSection fields={this._tableHeaders} sectionName={result} expanded={expanded} data={this.state.searchResults[result]} />
                    </>
                  );
                })}
              </tbody>
            </table>
          }
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}