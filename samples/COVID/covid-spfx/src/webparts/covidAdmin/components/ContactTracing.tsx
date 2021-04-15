import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { cloneDeep, isEqual, Dictionary, find, forEach } from "lodash";
import { cs } from "../../../common/covid.service";
import { IQuery, ICheckIns, Query } from "../../../common/covid.model";
import Button from "../../../common/components/atoms/Button";
import TableHeader from "./atoms/TableHeader";
import TableSectionHeader from "./atoms/TableSectionHeader";
import TableSection from "./atoms/TableSection";
import Search from "./molecules/Search";
import { IDropDownOption } from "../../../common/components/atoms/DropDown";
import styles from "./CovidAdmin.module.scss";

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
    public sectionExpanded: { section: string, expanded: boolean; }[] = [],
  ) { }
}

export default class ContactTracing extends React.Component<IContactTracingProps, IContactTracingState> {
  private LOG_SOURCE: string = "🔶 ContactTracing";
  private _tableHeaders: string[] = ['Name', 'Office', 'Check In Time'];
  private _peopleOptions: IDropDownOption[] = [{ key: "", text: "" }];

  constructor(props: IContactTracingProps) {
    super(props);
    this.state = new ContactTracingState();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 14);
    this._search({ endDate: new Date(), startDate: startDate, office: null, person: null });
  }

  public shouldComponentUpdate(nextProps: IContactTracingProps, nextState: IContactTracingState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _search = async (query: IQuery): Promise<void> => {
    try {
      let searchResults;
      if (query.person) {
        const person = (query.person) ? query.person : null;
        let searchQuery: IQuery = new Query(
          query.startDate,
          query.endDate,
          query.office,
          null
        );
        searchResults = await cs.traceCheckIn(searchQuery, person);
      } else {
        searchResults = await cs.searchCheckIn(query);
      }

      for (let key in searchResults) {
        let value = searchResults[key];
        if (value.length > 0) {

          forEach(value, (p) => {
            if (p.Employee == null) {
              const found = find(this._peopleOptions, { key: p.Guest, text: p.Guest });
              if (found == undefined) {
                this._peopleOptions.push({ key: p.Guest, text: p.Guest });
              }
            } else {
              const found = find(this._peopleOptions, { key: p.EmployeeId, text: p.Employee.Title });
              if (found == undefined) {
                this._peopleOptions.push({ key: p.EmployeeId, text: p.Employee.Title });
              }
            }
          });
        }
      }
      const sectionExpanded = (searchResults != null) ? Object.getOwnPropertyNames(searchResults).map((section) => { return { section: section, expanded: true }; }) : [];
      this.setState({ searchResults, sectionExpanded });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_search) - ${err}`, LogLevel.Error);
    }
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

          <div>
            <Search search={this._search} peopleOptions={this._peopleOptions} />
          </div>
          <div>
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
                          colSpan={3}
                          sectionHeader={result}
                          expanded={expanded}
                          expandClick={() => { this.expandEvent(result); }}
                        />
                        <TableSection sectionName={result} expanded={expanded} fields={this._tableHeaders} data={this.state.searchResults[result]} />
                      </>
                    );
                  })}
                </tbody>
              </table>
            }
          </div>

        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}