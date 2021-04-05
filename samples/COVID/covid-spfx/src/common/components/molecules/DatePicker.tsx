import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "lodash";
import ButtonIcon from "../atoms/ButtonIcon";
import { Icons } from "../../enums";

export interface IDatePickerProps {
  selectedDate: Date;
  onDateChange: (dateOffset: number) => void;
}

export interface IDatePickerState {
}

export class DatePickerState implements IDatePickerState {
  constructor() { }
}

export default class DatePicker extends React.Component<IDatePickerProps, IDatePickerState> {
  private LOG_SOURCE: string = "🔶DatePicker";

  constructor(props: IDatePickerProps) {
    super(props);
    this.state = new DatePickerState();
  }

  public shouldComponentUpdate(nextProps: IDatePickerProps, nextState: IDatePickerState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IDatePickerProps> {
    try {

      return (
        <div className="dateSelector">
          <ButtonIcon iconType={Icons.LeftArrow} onClick={() => this.props.onDateChange(-1)} />
          <h2>{this.props.selectedDate.toLocaleDateString()}</h2>
          <ButtonIcon iconType={Icons.RightArrow} onClick={() => this.props.onDateChange(1)} />
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}