import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import { isEqual } from "@microsoft/sp-lodash-subset";
import { cloneDeep } from "@microsoft/sp-lodash-subset";
import { DateTime } from "luxon";

import { rr } from "../../services/rr.service";
import { IMeetingResult, IRoomResults, MeetingResult } from "../../models/rr.models";
import strings from "RoomReservationWebPartStrings";
import Label from "../atoms/Label";
import DropDown, { IDropDownOption } from "../atoms/DropDown";
import Button from "../atoms/Button";


export interface INewReservationProps {
  onChange: (meeting: IMeetingResult) => void;
}

export interface INewReservationState {
  start: DateTime;
  end: DateTime;
  participants: number;
  subject: string;
}

export class NewReservationState implements INewReservationState {
  constructor(
    public rooms: IRoomResults[] = [],
    public start: DateTime = DateTime.local().setLocale(rr.Locale).plus({ hours: 1 }).set({ minute: 0 }),
    public end: DateTime = DateTime.local().setLocale(rr.Locale).plus({ hours: 2 }).set({ minute: 0 }),
    public participants: number = 1,
    public subject: string = "New Meeting",
  ) { }
}

export default class NewReservation extends React.Component<INewReservationProps, INewReservationState> {
  private LOG_SOURCE: string = "🔶 NewReservation";
  private _maxParticipants: number = 15;
  private _participantOpts: IDropDownOption[] = [];

  constructor(props: INewReservationProps) {
    super(props);
    for (let i = 1; i <= this._maxParticipants; i++) {
      this._participantOpts.push({ key: i, text: i.toString() });
    }
    this.state = new NewReservationState();
  }

  public shouldComponentUpdate(nextProps: Readonly<INewReservationProps>, nextState: Readonly<INewReservationState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _onDropDownChange = (fieldValue: string, fieldName: string) => {
    try {
      let participants: number = parseInt(fieldValue);
      this.setState({ participants: participants });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onDropDownChange) - ${err}`, LogLevel.Error);
    }
  }

  private _onDateChange = (fieldValue: string, fieldName: string) => {
    try {
      const state = cloneDeep(this.state);

      const start = DateTime.fromISO(fieldValue).setLocale(rr.Locale);
      state[fieldName] = start;

      this.setState(state);

    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onDateChange) - ${err}`, LogLevel.Error);
    }
  }

  private _onTextChange = (fieldValue: string, fieldName: string) => {
    try {
      const state = cloneDeep(this.state);
      state[fieldName] = fieldValue;

      this.setState(state);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onTextChange) - ${err}`, LogLevel.Error);
    }
  }

  private _onChange() {
    try {
      const displayTime = rr.GetMeetingDisplayTime(this.state.start, this.state.end);
      let meeting = new MeetingResult(
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        rr.Config.meetings.length,
        this.state.subject,
        this.state.start,
        this.state.end,
        displayTime,
        0,
        0,
        -1,
        "",
        this.state.participants
      );
      this.props.onChange(meeting);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onChange) - ${err}`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<INewReservationProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE}>
          <div className="new-reservation">
            <div>
              <Label label={`${strings.SubjectLabel}:`} labelFor="subject" />
              <input
                className="hoo-input-text"
                type="text"
                id="subject"
                value={this.state.subject}
                onChange={(newValue) => { this._onTextChange(newValue.target.value, "subject"); }} />

            </div>
            <div>
              <Label label={`${strings.StartLabel}:`} labelFor="startDate" />
              <input
                className="hoo-input-text"
                id="startDate"
                type="datetime-local"
                value={this.state.start.toISO().substr(0, 16)}
                onChange={(newValue) => { this._onDateChange(newValue.target.value, "start"); }} />

            </div>
            <div>
              <Label label={`${strings.EndLabel}:`} labelFor="endDate" />
              <input
                className="hoo-input-text"
                id="endDate"
                type="datetime-local"
                value={this.state.end.toISO().substr(0, 16)}
                onChange={(newValue) => { this._onDateChange(newValue.target.value, "end"); }} />
            </div>
            <div>
              <Label label={`${strings.ParticipantsLabel}:`} labelFor="participants" />
              <DropDown
                containsTypeAhead={false}
                options={this._participantOpts}
                id="participants"
                value={this.state.participants}
                onChange={this._onDropDownChange} />
            </div>
            <Button className="hoo-button-primary" disabled={false} label="Check Room Availability" onClick={() => this._onChange()} />
          </div>
        </div>

      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}