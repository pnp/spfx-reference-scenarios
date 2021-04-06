import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "lodash";
import Avatar, { Size } from "../atoms/Avatar";

export interface ITableCellOption {
  key: string | number;
  text: string;
}

export interface ITableRowOption {
  key: string | number;
  cells: ITableCellOption[];
}

export interface ITableProps {
  cells: ITableCellOption[];
}

export interface ITableState {
}

export class TableState implements ITableState {
  constructor() { }
}

export default class Table extends React.Component<ITableProps, ITableState> {
  private LOG_SOURCE: string = "🔶Table";

  constructor(props: ITableProps) {
    super(props);
    this.state = new TableState();
  }

  public shouldComponentUpdate(nextProps: ITableProps, nextState: ITableState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ITableProps> {
    try {

      return (
        <table className="lqd-table">
          <thead>
            <tr>
              {this.props.cells.map((ri) => {
                return (
                  <th>{ri.text}</th>
                );
              })}
            </tr>
          </thead>
          <tbody>

            <tr>
              <td>
                <Avatar size={Size.FortyEight} src="https://pbs.twimg.com/profile_images/1238648419415187457/53YpWGZ4_400x400.jpg" />
              </td>
              <td></td>
              <td></td>
              <td>status</td>
              <td></td>
            </tr>

          </tbody>
          <tfoot>
            <tr>
              {this.props.cells.map((ri) => {
                return (
                  <th>{ri.text}</th>
                );
              })}
            </tr>
          </tfoot>
        </table>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}