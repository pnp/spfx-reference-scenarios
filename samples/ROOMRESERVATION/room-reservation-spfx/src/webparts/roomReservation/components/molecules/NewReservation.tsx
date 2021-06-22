import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import cloneDeep from "lodash/cloneDeep";
import { DateTime } from "luxon";

import { rr } from "../../services/rr.service";
import { IRoomResults } from "../../models/rr.models";
import strings from "RoomReservationWebPartStrings";
import Label from "../atoms/Label";
import DropDown, { IDropDownOption } from "../atoms/DropDown";


export interface INewReservationProps {
  onChange: (start: DateTime, end: DateTime, participants: number) => void;
}

export interface INewReservationState {
  start: DateTime;
  end: DateTime;
  participants: number;
}

export class NewReservationState implements INewReservationState {
  constructor(
    public rooms: IRoomResults[] = [],
    public start: DateTime = DateTime.local().setLocale(rr.Locale).plus({ hours: 1 }).set({ minute: 0 }),
    public end: DateTime = DateTime.local().setLocale(rr.Locale).plus({ hours: 2 }).set({ minute: 0 }),
    public participants: number = 1
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

  private _onDropDownChange = (fieldValue: string, fieldName: string) => {
    try {
      let participants: number = parseInt(fieldValue);
      this.setState({ participants: participants });
      this._onChange();
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
      this._onChange();

    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onDateChange) - ${err}`, LogLevel.Error);
    }
  }

  private _onChange() {
    try {
      this.props.onChange(this.state.start, this.state.end, this.state.participants);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onChange) - ${err}`, LogLevel.Error);
    }
  }

  public shouldComponentUpdate(nextProps: Readonly<INewReservationProps>, nextState: Readonly<INewReservationState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<INewReservationProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE}>
          <h3>{strings.CheckAvailability}</h3>
          <div className="new-reservation">
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

          </div>
        </div>

      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}