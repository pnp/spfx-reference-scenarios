import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { cloneDeep, find, isEqual, replace } from "lodash";
import { HOUR_TYPE, IPerson, Schedule } from "../../models/wc.models";
import { DateTime } from "luxon";
import { wc } from "../../services/wc.service";
import ButtonIcon from "../atoms/ButtonIcon";
import { Icons } from "../../models/wc.Icons";
import strings from "WorldClockWebPartStrings";
import Button from "../atoms/Button";

export interface ISchedulerProps {
  meetingMembers: IPerson[];
  removeFromMeeting: (IPerson) => void;
}

export interface ISchedulerState {
  meetingTimes: DateTime[];
  selectedTime: DateTime;
  dateInput: DateTime;
  scheduleDisabled: boolean;
}

export class SchedulerState implements ISchedulerState {
  constructor(
    public meetingTimes: DateTime[] = [],
    public selectedTime: DateTime = null,
    public dateInput: DateTime = DateTime.local().setLocale(wc.Locale).setZone(wc.IANATimeZone),
    public scheduleDisabled: boolean = true,
  ) { }
}

export default class Scheduler extends React.Component<ISchedulerProps, ISchedulerState> {
  private LOG_SOURCE: string = "🔶 Scheduler";
  private _maxDays: number = 1;

  constructor(props: ISchedulerProps) {
    super(props);
    let meetingTimes = this._getMeetingTimes(DateTime.local().setLocale(wc.Locale).setZone(wc.IANATimeZone));
    this.state = new SchedulerState(meetingTimes);
  }

  public shouldComponentUpdate(nextProps: Readonly<ISchedulerProps>, nextState: Readonly<ISchedulerState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _setSelectedTime(date: DateTime) {
    let scheduleDisabled = false;
    if (date == this.state.selectedTime) {
      date = null;
      scheduleDisabled = true;
    } else {
      date = date.setZone(wc.IANATimeZone);
    }
    this.setState({ selectedTime: date, scheduleDisabled: scheduleDisabled });
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

  private _getMeetingTimes(date: DateTime) {
    let meetingTimes: DateTime[] = [];
    let meetingTime: DateTime = date.setLocale(wc.Locale);
    for (let i = 0; i < this._maxDays; i++) {
      meetingTime = meetingTime.plus({ days: i });
      meetingTime = meetingTime.set({ minute: 0 });
      for (let h = 0; h < 24; h++) {
        meetingTime = meetingTime.plus({ hours: 1 });
        meetingTimes.push(meetingTime.set({ minute: 0 }));
      }
    }
    return meetingTimes;
  }

  private _onDateChange = (fieldValue: string) => {
    try {
      const now: DateTime = DateTime.local().setLocale(wc.Locale).setZone(wc.IANATimeZone);
      const newDate = DateTime.fromFormat(fieldValue + now.hour, "yyyy-MM-ddH");
      let meetingTimes = this._getMeetingTimes(newDate);
      this.setState({ dateInput: newDate, meetingTimes: meetingTimes, selectedTime: null, scheduleDisabled: true });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onDateChange) - ${err}`, LogLevel.Error);
    }
  }

  private _scheduleMeeting() {
    let meetingURL = "https://teams.microsoft.com/l/meeting/new?subject=New%20Meeting&attendees=__ATTENDEES__&startTime=__STARTTIME__";
    let attendees: string = "";
    // this.props.meetingMembers.map((m) => {
    //   attendees += m.email + ","
    // });
  }

  public render(): React.ReactElement<ISchedulerProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className="schedule" >
          <div className="date-picker">
            <input className="hoo-input-text" id="startDate" type="date" value={this.state.dateInput.toISO().substr(0, 10)} onChange={(newValue) => { this._onDateChange(newValue.target.value); }} />
            <Button className="hoo-button-primary" disabled={this.state.scheduleDisabled} label={strings.ScheduleMeetingLabel} onClick={() => this._scheduleMeeting()} />
          </div>
          <div className="hoo-dtstable">

            <div data-dow="" className="hoo-dtsentry no-hover">
              <label htmlFor="" className="hoo-dtsday"></label>
              <div className={`hoo-dtshours-label`}></div>
              {this.state.meetingTimes.map((h) => {
                return (<div className={`hoo-dtshours-label ${(this.state.selectedTime && (h.hour == this.state.selectedTime.hour)) ? "isSelected" : ""}`} data-time="" onClick={() => this._setSelectedTime(h)}>{replace(h.toLocaleString(DateTime.TIME_SIMPLE), ":00", "")}</div>);
              })}
            </div>

            {this.props.meetingMembers.map((m) => {
              return (<div data-dow="" className="hoo-dtsentry"><label htmlFor="" className="hoo-dtsday">{m.displayName}</label>
                <div className={`hoo-dtshours no-bg`} data-time=""><ButtonIcon iconType={Icons.Trash} altText={strings.TrashLabel} onClick={() => this.props.removeFromMeeting(m)} /></div>
                {this.state.meetingTimes.map((h) => {
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