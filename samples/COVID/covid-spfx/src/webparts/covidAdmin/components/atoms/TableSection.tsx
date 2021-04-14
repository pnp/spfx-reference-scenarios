import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";
import { ICheckIns } from "../../../../common/covid.model";
import Persona, { Size, Presence } from "../../../../common/components/molecules/Persona";
import styles from "../CovidAdmin.module.scss";

export interface ITableSectionProps {
  sectionName: string;
  expanded: boolean;
  data: ICheckIns[];
}

export interface ITableSectionState {
}

export class TableSectionState implements ITableSectionState {
  constructor() { }
}

export default class TableSection extends React.Component<ITableSectionProps, ITableSectionState> {
  private LOG_SOURCE: string = "🔶TableSection";

  constructor(props: ITableSectionProps) {
    super(props);
    this.state = new TableSectionState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ITableSectionProps>, nextState: Readonly<ITableSectionState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ITableSectionProps> {
    try {
      return (
        <>
          {this.props.data && this.props.data.map((o) => {
            return (
              <tr data-section={this.props.sectionName} className={this.props.expanded ? "is-visible" : "is-hidden"} aria-hidden={!this.props.expanded}>
                <td></td>
                <td>
                  <Persona size={Size.FortyEight}
                    src={(o.Employee) ? o.Employee.PhotoBlobUrl : ""}
                    showPresence={true}
                    presence={(o.Employee) ? Presence[o.Employee.Presence?.activity] : Presence.PresenceUnknown}
                    status={(o.Employee) ? o.Employee.Presence?.availability : ""}
                    name={o.Employee?.Title || o.Guest}
                    jobTitle={(o.Employee) ? o.Employee.JobTitle : "Guest"}
                  />
                </td>
                <td>{o.CheckInOffice}</td>
                <td>{o.CheckIn?.toLocaleString()}</td>
              </tr>
            );
          })
          }
        </>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}