import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { find, isEqual, replace } from "lodash";
import { HOUR_TYPE, IPerson, Schedule } from "../../models/wc.models";
import { DateTime } from "luxon";
import { wc } from "../../services/wc.service";
import ButtonIcon from "../atoms/ButtonIcon";
import { Icons } from "../../models/wc.Icons";
import strings from "WorldClockWebPartStrings";

export interface ISchedulerProps {
  meetingMembers: IPerson[];
  removeFromMeeting: (IPerson) => void;
}

export interface ISchedulerState {
  meetingDate: DateTime;
  selectedTime: DateTime;
}

export class SchedulerState implements ISchedulerState {
  constructor(
    public meetingDate: DateTime = DateTime.local().setLocale(wc.Locale).setZone(wc.IANATimeZone),
    public selectedTime: DateTime = null
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

  private _setSelectedTime(date: DateTime) {
    date = date.setZone(wc.IANATimeZone);
    this.setState({ selectedTime: date });
  }

  private _getDateTimeString(person: IPerson, date: DateTime) {
    date = date.setZone(person.IANATimeZone);
    let dateTime: string = date.toLocaleString(DateTime.DATETIME_SHORT);
    return dateTime;
  }

  private _setBlockStyle(person: IPerson, date: DateTime) {
    let retVal: string = "";
    try {
      let schedule = person.schedule;
      //TODO: How do we ensure that everyone has a schedule even if it is the default.
      if (!schedule) {
        schedule = new Schedule();
      }
      if (this.state.selectedTime) {
        if ((date.weekday == this.state.selectedTime.weekday) && (date.hour == this.state.selectedTime.hour)) {
          retVal += " " + "is-selected";
        }
      }
      date = date.setZone(person.IANATimeZone);
      let day = find(schedule.days, { dayId: date.weekday });
      let hour = find(day.hours, { hourId: date.hour });
      let isNextDay: boolean = (hour.hourId == 23);

      switch (hour.workingType) {
        case HOUR_TYPE.ExtendedHour: {
          retVal += " is-extended";
          break;
        }
        case HOUR_TYPE.NotWorking: {
          retVal += " is-away";
          break;
        }
        default: {

          break;
        }
      }

      if (isNextDay) {
        retVal += " " + "is-nextday";
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
              <div className={`hoo-dtshours-label`}></div>
              {this._meetingTimes.map((h) => {
                return (<div className={`hoo-dtshours-label ${(this.state.selectedTime && (h.hour == this.state.selectedTime.hour)) ? "isSelected" : ""}`} data-time="" onClick={() => this._setSelectedTime(h)}>{replace(h.toLocaleString(DateTime.TIME_SIMPLE), ":00", "")}</div>);
              })}
            </div>

            {this.props.meetingMembers.map((m) => {
              return (<div data-dow="" className="hoo-dtsentry"><label htmlFor="" className="hoo-dtsday">{m.displayName}</label>
                <div className={`hoo-dtshours no-bg`} data-time=""><ButtonIcon iconType={Icons.Trash} altText={strings.TrashLabel} onClick={() => this.props.removeFromMeeting(m)} /></div>
                {this._meetingTimes.map((h) => {
                  return (<div className={`hoo-dtshours ${this._setBlockStyle(m, h)}`} title={this._getDateTimeString(m, h)} data-time="" onClick={() => { }}></div>);
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