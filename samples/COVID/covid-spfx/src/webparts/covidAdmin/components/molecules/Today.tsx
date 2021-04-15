import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";
import TableHeader from "../atoms/TableHeader";
import TableSection from "../atoms/TableSection";
import { ICheckIns } from "../../../../common/covid.model";

export interface ITodayProps {
  data: ICheckIns[];
}

export interface ITodayState {
}

export class TodayState implements ITodayState {
  constructor() { }
}

export default class Today extends React.Component<ITodayProps, ITodayState> {
  private LOG_SOURCE: string = "Today";
  private _tableHeaders: string[] = ['Name', 'Office', 'Submitted', 'Status', 'Check In Time'];

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
              {this.props.data.map((result) => {
                return (
                  <TableSection fields={this._tableHeaders} data={this.props.data} />
                );
              })}
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