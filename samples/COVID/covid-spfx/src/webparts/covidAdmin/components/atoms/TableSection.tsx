import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";

import { ICheckIns } from "../../models/covid.model";
import Persona, { Size, Presence } from "../molecules/Persona";
import ButtonIcon from "./ButtonIcon";
import { Icons } from "../../models/enums";

export interface ITableSectionProps {
  fields: string[];
  data: ICheckIns[];
  sectionName?: string;
  expanded?: boolean;
  checkIn?: (checkIn: ICheckIns) => void;
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
      const expandedClass = (typeof this.props.expanded == "undefined") ? "" : (this.props.expanded ? "is-visible" : "is-hidden");
      return (
        <>
          {this.props.data && this.props.data.map((o) => {
            return (
              <tr data-section={this.props.sectionName || ""} className={expandedClass} aria-hidden={!(this.props.expanded || true)}>
                {(typeof this.props.expanded != "undefined") &&
                  <td></td>
                }
                {this.props.fields.map((field) => {
                  return (
                    <td className={((field == "Status" || field == "Check In")) ? 'centered' : ""}>
                      {field == "Name" &&
                        <Persona size={Size.FortyEight}
                          src={(o.Employee) ? o.Employee.PhotoBlobUrl : ""}
                          showPresence={true}
                          presence={(o.Employee) ? Presence[o.Employee.Presence?.activity] : Presence.PresenceUnknown}
                          status={(o.Employee) ? o.Employee.Presence?.availability : ""}
                          name={o.Employee?.Title || o.Guest}
                          jobTitle={(o.Employee) ? o.Employee.JobTitle : "Guest"}
                        />
                      }
                      {field == "Office" &&
                        <>{o.CheckInOffice}</>
                      }
                      {field == "Submitted" &&
                        <>{o.SubmittedOn?.toLocaleString()}</>
                      }
                      {field == "Status" &&
                        <span className={`checkIn ${(o.CheckIn) ? 'isCheckedIn' : ''}`} />
                      }
                      {field == "Check In Time" &&
                        <>{o.CheckIn?.toLocaleString()}</>
                      }
                      {field == "Check In" && !o.CheckIn &&
                        <ButtonIcon iconType={Icons.Check} onClick={() => { this.props.checkIn(o); }} />
                      }
                    </td>
                  );
                })}
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