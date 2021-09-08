import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "@microsoft/sp-lodash-subset";

import ButtonIcon from "../atoms/ButtonIcon";
import { Icons } from "../../models/enums";

export interface ITableHeaderProps {
  columnNames: string[];
  expanded?: boolean;
  expandClick?: () => void;
}

export interface ITableHeaderState {
}

export class TableHeaderState implements ITableHeaderState {
  constructor() { }
}

export default class TableHeader extends React.Component<ITableHeaderProps, ITableHeaderState> {
  private LOG_SOURCE: string = "🔶TableHeader";

  constructor(props: ITableHeaderProps) {
    super(props);
    this.state = new TableHeaderState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ITableHeaderProps>, nextState: Readonly<ITableHeaderState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ITableHeaderProps> {
    try {
      return (
        <thead data-component={this.LOG_SOURCE}>
          <tr className="collapsable" data-sectionHeader="all">
            {this.props.expanded != null &&
              <th className="hoo-table-iconcell" scope="col">
                <ButtonIcon iconType={(this.props.expanded) ? Icons.DownArrow : Icons.RightArrow} onClick={this.props.expandClick} />
              </th>
            }
            {this.props.columnNames && this.props.columnNames.map((cn) => {
              return (<th scope="col" className={(cn == "Status") ? 'centered' : ""} >{cn}</th>);
            })}
          </tr>
        </thead>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}