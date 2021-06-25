import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";

import ButtonIcon from "../atoms/ButtonIcon";
import { Icons } from "../../models/enums";

export interface ITableSectionHeaderProps {
  sectionName: string;
  colSpan: number;
  sectionHeader: string;
  expanded: boolean;
  expandClick: () => void;
}

export interface ITableSectionHeaderState {
}

export class TableSectionHeaderState implements ITableSectionHeaderState {
  constructor() { }
}

export default class TableSectionHeader extends React.Component<ITableSectionHeaderProps, ITableSectionHeaderState> {
  private LOG_SOURCE: string = "🔶TableSectionHeader";

  constructor(props: ITableSectionHeaderProps) {
    super(props);
    this.state = new TableSectionHeaderState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ITableSectionHeaderProps>, nextState: Readonly<ITableSectionHeaderState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ITableSectionHeaderProps> {
    try {
      return (
        <tr data-component={this.LOG_SOURCE} className="collapsable" data-sectionHeader={this.props.sectionName} aria-hidden={!this.props.expanded} aria-expanded={this.props.expanded}>
          <th className="hoo-table-iconcell">
            <ButtonIcon iconType={Icons.DownArrow} onClick={this.props.expandClick} />
          </th>
          <th colSpan={this.props.colSpan}>
            <div className="hoo-table-subheader"><span>{this.props.sectionHeader}</span></div>
          </th>
        </tr>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}