import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { cloneDeep, find, isEqual, merge, replace } from "lodash";
import { DateTime } from "luxon";
import { wc } from "../../services/wc.service";
import { HOUR_TYPE, IPerson, ISchedule, Person, Schedule } from "../../models/wc.models";
import Button from "../atoms/Button";
import styles from "../WorldClock.module.scss";
import strings from "WorldClockWebPartStrings";

export interface IProfileProps {
  user: IPerson;
  save: (person: IPerson) => void;
  cancel: () => void;
}

export interface IProfileState {
  currentPerson: IPerson;
}

export class ProfileState implements IProfileState {
  constructor(
    public currentPerson: IPerson = new Person()
  ) { }
}

export default class Profile extends React.Component<IProfileProps, IProfileState> {
  private LOG_SOURCE: string = "🔶 Profile";

  constructor(props: IProfileProps) {
    super(props);
    let schedule = this.props.user.schedule;
    if (!schedule) {
      schedule = new Schedule();
    }
    let currentPerson = this.props.user;
    currentPerson.schedule = schedule;

    this.state = new ProfileState(currentPerson);
  }

  public shouldComponentUpdate(nextProps: Readonly<IProfileProps>, nextState: Readonly<IProfileState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public _updateSchedule(dayId: number, hourId: number) {
    try {
      let person = cloneDeep(this.state.currentPerson);
      let schedule = person.schedule;
      let day = find(schedule.days, { dayId: dayId });
      let hour = find(day.hours, { hourId: hourId });
      schedule.days.map((d) => {
        if (d.dayId == dayId) {
          d.hours.map((h) => {
            if (h.hourId == hourId) {
              switch (hour.workingType) {
                case HOUR_TYPE.WorkingHour: {
                  hour.workingType = HOUR_TYPE.ExtendedHour;
                  break;
                }
                case HOUR_TYPE.ExtendedHour: {
                  hour.workingType = HOUR_TYPE.NotWorking;
                  break;
                }
                case HOUR_TYPE.NotWorking: {
                  hour.workingType = HOUR_TYPE.WorkingHour;
                  break;
                }
              }
            }
          });
        }
      });
      person.schedule = schedule;
      this.setState({ currentPerson: person });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_updateSchedule) - ${err}`, LogLevel.Error);
      return null;
    }

  }

  public render(): React.ReactElement<IProfileProps> {
    try {
      var today = DateTime.now().setLocale(wc.Locale);
      return (
        <div data-component={this.LOG_SOURCE} className="hoo-dtstable profile">

          <div data-dow="" className="hoo-dtsentry no-hover">
            <label htmlFor="" className="hoo-dtsday"></label>
            {this.state.currentPerson.schedule.days[0].hours.map((h) => {
              return (<div className="hoo-dtshours-label" data-time="">{replace(today.set({ hour: h.hourId, minute: 0 }).toLocaleString(DateTime.TIME_SIMPLE), ":00", "")}</div>);
            })}
          </div>

          {this.state.currentPerson.schedule.days.map((d) => {
            return (<div data-dow="" className="hoo-dtsentry"><label htmlFor="" className="hoo-dtsday">{today.set({ weekday: d.dayId }).weekdayLong}</label>
              {d.hours.map((h) => {
                return (<div className={`hoo-dtshours ${(h.workingType == HOUR_TYPE.ExtendedHour) ? "is-extended" : (h.workingType == HOUR_TYPE.NotWorking) ? "is-away" : ""}`} data-time="" onClick={() => this._updateSchedule(d.dayId, h.hourId)}></div>);
              })}

            </div>);
          })}

          <div className="is-flex gap" >
            <Button
              className="hoo-button-primary"
              disabled={false}
              label={strings.SaveLabel}
              onClick={() => this.props.save(this.state.currentPerson)} />
            <Button
              className="hoo-button"
              disabled={false}
              label={strings.CancelLabel}
              onClick={() => this.props.cancel()} />
          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}