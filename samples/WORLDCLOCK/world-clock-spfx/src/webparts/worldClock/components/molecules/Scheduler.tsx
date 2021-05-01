import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { find, isEqual, replace } from "lodash";
import { HOUR_TYPE, IPerson, Schedule } from "../../models/wc.models";
import { DateTime } from "luxon";
import { wc } from "../../services/wc.service";

export interface ISchedulerProps {
  meetingMembers: IPerson[];
}

export interface ISchedulerState {
  meetingDate: DateTime;
}

export class SchedulerState implements ISchedulerState {
  constructor(
    public meetingDate: DateTime = DateTime.local().setLocale(wc.Locale).setZone(wc.IANATimeZone)
  ) { }
}

export default class Scheduler extends React.Component<ISchedulerProps, ISchedulerState> {
  private LOG_SOURCE: string = "🔶 Scheduler";
  private _maxDays: number = 1;
  private _meetingTimes: DateTime[] = [];
  private _now: DateTime = DateTime.now().setLocale(wc.Locale);

  constructor(props: ISchedulerProps) {
    super(props);
    let meetingTime: DateTime = DateTime.now().setLocale(wc.Locale);
    for (let i = 0; i < this._maxDays; i++) {
      meetingTime = meetingTime.plus({ days: i });
      meetingTime = meetingTime.set({ minute: 0 });
      for (let h = 0; h < 24; h++) {
        meetingTime = meetingTime.plus({ hours: 1 });
        this._meetingTimes.push(meetingTime.set({ minute: 0 }));
      }
    }
    this.state = new SchedulerState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ISchedulerProps>, nextState: Readonly<ISchedulerState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _getAvailability(person: IPerson, date: DateTime) {
    let retVal: string = "";
    try {
      let schedule = person.schedule;
      //TODO: How do we ensure that everyone has a schedule even if it is the default.
      if (!schedule) {
        schedule = new Schedule();
      }
      let day = find(schedule.days, { dayId: date.weekday });
      let hour = find(day.hours, { hourId: date.hour });

      switch (hour.workingType) {
        case HOUR_TYPE.ExtendedHour: {
          retVal = "is-extended";
          break;
        }
        case HOUR_TYPE.NotWorking: {
          retVal = "is-away";
          break;
        }
        default: {

          break;
        }
      }

    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_getAvailability) - ${err}`, LogLevel.Error);
      return null;
    }
    return retVal;
  }

  public render(): React.ReactElement<ISchedulerProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className="schedule" >
          <div className="hoo-dtstable">

            <div data-dow="" className="hoo-dtsentry no-hover">
              <label htmlFor="" className="hoo-dtsday"></label>
              {this._meetingTimes.map((h) => {
                return (<div className="hoo-dtshours-label" data-time="">{replace(h.toLocaleString(DateTime.TIME_SIMPLE), ":00", "")}</div>);
              })}
            </div>

            {this.props.meetingMembers.map((m) => {
              return (<div data-dow="" className="hoo-dtsentry"><label htmlFor="" className="hoo-dtsday">{m.displayName}</label>
                {this._meetingTimes.map((h) => {
                  return (<div className={`hoo-dtshours ${this._getAvailability(m, h)}`} data-time="" onClick={() => { }}></div>);
                })}

              </div>);
            })}
          </div>
        </div>

      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}