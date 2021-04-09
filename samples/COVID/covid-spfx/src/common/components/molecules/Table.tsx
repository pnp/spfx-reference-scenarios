import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "lodash";
import Avatar, { Size } from "../atoms/Avatar";



export interface ITableCell {
  key: string | number;
  className: string;
  element: React.ReactElement;
}
export interface ITableRow {
  key: string | number;
  className: string;
  cells: ITableCell[];
}

export interface ITable {
  headers: string[];
  footers: string[];
  dataRows: ITableRow[];
}

export interface ITableProps {
  table: ITable;
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
              {this.props.table.headers.map((h) => {
                return (
                  <th>{h}</th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {this.props.table.dataRows?.map((r) => {
              return (
                <tr key={r.key}>
                  {r.cells.map((c) => {
                    return (
                      <td key={c.key} className={c.className}>
                        {c.element}
                      </td>
                    );
                  })}
                </tr>
              );
            })}

          </tbody>
          <tfoot>
            <tr>
              {this.props.table.footers.map((f) => {
                return (
                  <th>{f}</th>
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