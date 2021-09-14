import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "@microsoft/sp-lodash-subset";
import strings from "CovidWebPartStrings";
import TableHeader from "../atoms/TableHeader";
import TableSection from "../atoms/TableSection";
import { ICheckIns } from "../../models/covid.model";

export interface ITodayProps {
  data: ICheckIns[];
  checkIn?: (checkIn: ICheckIns) => void;
}

export interface ITodayState {
}

export class TodayState implements ITodayState {
  constructor() { }
}

export default class Today extends React.Component<ITodayProps, ITodayState> {
  private LOG_SOURCE: string = "Today";
  private _tableHeaders: string[] = strings.TodayTableHeaders;
  //These map to an if statement in TableSection.tsx to determine what fields to show
  private _tableFieldNames: string[] = ['Name', 'Office', 'Submitted', 'Status', 'Check In Time', 'Check In'];

  constructor(props: ITodayProps) {
    super(props);
    this.state = new TodayState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ITodayProps>, nextState: Readonly<ITodayState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ITodayProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE}>
          <table className="hoo-table">
            <TableHeader columnNames={this._tableHeaders} />
            <tbody>
              <TableSection fields={this._tableFieldNames} data={this.props.data} checkIn={this.props.checkIn} />
            </tbody>
          </table>
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}