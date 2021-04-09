import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "lodash";
import ButtonIcon from "../atoms/ButtonIcon";
import { Icons } from "../../enums";

export interface ICollapsibleTableCell {
  key: string | number;
  className?: string;
  element: React.ReactElement;
}
export interface ICollapsibleTableRow {
  key: string | number;
  className?: string;
  cells: ICollapsibleTableCell[];
}
export interface ICollapsibleTableSection {
  key: string | number;
  className?: string;
  sectionHeader: string;
  rows: ICollapsibleTableRow[];
}

export interface ICollapsibleTable {
  headers: string[];
  sections: ICollapsibleTableSection[];
}

export interface ICollapsibleTableProps {
  table: ICollapsibleTable;
}

export interface ICollapsibleTableState {
}

export class CollapsibleTableState implements ICollapsibleTableState {
  constructor() { }
}

export default class CollapsibleTable extends React.Component<ICollapsibleTableProps, ICollapsibleTableState> {
  private LOG_SOURCE: string = "🔶CollapsibleTable";


  constructor(props: ICollapsibleTableProps) {
    super(props);
    this.state = new CollapsibleTableState();
  }

  public shouldComponentUpdate(nextProps: ICollapsibleTableProps, nextState: ICollapsibleTableState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ICollapsibleTableProps> {
    try {

      return (
        <table className="lqd-table is-collapsable">
          <thead>
            <tr className="collapsable" data-sectionHeader="all">
              <th className="lqd-table-iconcell" scope="col">
                <ButtonIcon iconType={Icons.DownArrow} onClick={() => { }} />
              </th>
              {this.props.table.headers.map((h) => {
                return (
                  <th scope="col">{h}</th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {this.props.table.sections?.map((s) => {
              return (
                <>
                  <tr key={s.key} className="collapsable" data-sectionHeader={`section${s.key}`}>
                    <th className="lqd-table-iconcell">
                      <ButtonIcon iconType={Icons.DownArrow} onClick={() => { }} />
                    </th>
                    <th aria-colspan={this.props.table.headers.length}>
                      <div className="lqd-table-subheader"><span>{s.sectionHeader}</span></div>
                    </th>
                  </tr>
                  {s.rows.map((r) => {
                    return (
                      <tr data-section={`section${s.key}`}>
                        <td></td>
                        {r.cells.map((c) => {
                          return (
                            <td className={c.className}>
                              {c.element}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </>
              );
            })}
          </tbody>
          <tfoot></tfoot>
        </table>

      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}