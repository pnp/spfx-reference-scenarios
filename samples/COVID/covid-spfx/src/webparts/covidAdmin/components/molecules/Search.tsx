import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
import find from "lodash/find";
import isEmpty from "lodash/isEmpty";

import styles from "../CovidAdmin.module.scss";
import { IQuery, Query } from "../../models/covid.model";
import { cs } from "../../services/covid.service";
import DropDown, { IDropDownOption } from "../atoms/DropDown";
import Button from "../atoms/Button";
import strings from "CovidWebPartStrings";

export interface ISearchProps {
  search: (query: IQuery) => void;
  peopleOptions: IDropDownOption[];
}

export interface ISearchState {
  startDate: Date;
  endDate: Date;
  office: string;
  person: string | number;
  personName: string;
}

export class SearchState implements ISearchState {
  constructor(
    public startDate: Date = new Date(),
    public endDate: Date = new Date(),
    public office: string = null,
    public person: string | number = null,
    public personName: string = null,
  ) { }
}

export default class Search extends React.Component<ISearchProps, ISearchState> {
  private LOG_SOURCE: string = "🔶Search";
  private _locationOptions: IDropDownOption[] = [];

  constructor(props: ISearchProps) {
    super(props);
    try {
      this._locationOptions = cs.Locations.map((l) => { return { key: l.Title, text: l.Title }; });
      this._locationOptions.unshift({ key: "", text: "" });
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 14);
      this.state = new SearchState(startDate);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (constructor) - ${err}`, LogLevel.Error);
    }
  }

  public shouldComponentUpdate(nextProps: ISearchProps, nextState: ISearchState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _onDateChange = (fieldValue: string, fieldName: string) => {
    try {
      const stateObj = cloneDeep(this.state);
      const newDate = new Date(fieldValue);
      stateObj[fieldName] = newDate;
      this.setState(stateObj);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onDateChange) - ${err}`, LogLevel.Error);
    }
  }

  private _onDropDownChange = (fieldValue: string, fieldName: string) => {
    try {
      const stateObj = cloneDeep(this.state);
      stateObj[fieldName] = fieldValue;
      this.setState(stateObj);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onDropDownChange) - ${err}`, LogLevel.Error);
    }
  }

  private _onPeopleDropDownChange = (fieldValue: string, fieldName: string) => {
    try {
      const stateObj = cloneDeep(this.state);
      var employeeID = parseInt(fieldValue);
      if (employeeID) {
        const found = find(this.props.peopleOptions, { key: employeeID });
        if (found) {
          stateObj[fieldName] = found.text;
        }
      } else {
        stateObj[fieldName] = fieldValue;
      }

      this.setState(stateObj);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onPeopleDropDownChange) - ${err}`, LogLevel.Error);
    }
  }

  private _updateSearch() {
    try {
      let person: string | number;
      const found = find(this.props.peopleOptions, { text: this.state.personName });
      if (found) {
        var employeeID = parseInt(found.key.toString());
        if (employeeID) {
          person = found.key;
        } else {
          if (!isEmpty(found.text)) {
            person = found.text;
          } else {
            person = null;
          }
        }
      }

      let searchQuery: IQuery = new Query(
        this.state.startDate,
        this.state.endDate,
        this.state.office,
        person
      );
      this.props.search(searchQuery);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_updateSearch) - ${err}`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<ISearchProps> {
    try {
      return (
        <div className={styles.searchControls}>
          <div >
            <div >{strings.SearchStartDateLabel}</div>
            <input className="hoo-input-text" id="startDate" type="date" value={this.state.startDate.toISOString().substr(0, 10)} onChange={(newValue) => { this._onDateChange(newValue.target.value, "startDate"); }} />
          </div>
          <div >
            <div >{strings.SearchEndDateLabel}</div>
            <input className="hoo-input-text" id="endDate" type="date" value={this.state.endDate.toISOString().substr(0, 10)} onChange={(newValue) => { this._onDateChange(newValue.target.value, "endDate"); }} />
          </div>
          <div>
            <div>{strings.SearchOfficeLabel}</div>
            <DropDown onChange={this._onDropDownChange} value={this.state.office} options={this._locationOptions} id="office" />
          </div>
          <div>
            <div >{strings.SearchPersonLabel}</div>
            <DropDown onChange={this._onPeopleDropDownChange} value={this.state.personName} options={this.props.peopleOptions} id="personName" />
          </div>
          <div>
            <div >&nbsp;</div>
            <Button className="hoo-button-primary" disabled={false} label={strings.SearchButtonLabel} onClick={() => this._updateSearch()} />
          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}