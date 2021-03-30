import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "lodash";
import { ILocations } from "../../../../common/covid.model";

export interface IDropDownProps {
  options: ILocations[];
  name: string;
  onChange: (fieldValue: string, fieldName: string) => void;
}

export interface IDropDownState {
  value: string;
}

export class DropDownState implements IDropDownState {
  constructor(
    public value: string = ""
  ) { }
}

export default class DropDown extends React.Component<IDropDownProps, IDropDownState> {
  private LOG_SOURCE: string = "DropDown";

  constructor(props: IDropDownProps) {
    super(props);
    this.state = new DropDownState();
  }

  public shouldComponentUpdate(nextProps: IDropDownProps, nextState: IDropDownState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _onChange = (newValue: any, fieldName: string) => {
    try {
      this.props.onChange(newValue.value, fieldName);
    } catch (err) {
      Logger.write(`${err} - ${this.LOG_SOURCE} (_onChange)`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<IDropDownProps> {
    try {
      return (
        <>
          <div id='custom-select-status' className='hidden-visually' aria-live="polite"></div>
          <div className="lqd-select">
            <input type="text" id="lqd-select-input" className="lqd-select-text" aria-autocomplete="both" aria-controls="custom-select-list" />
            <button className="lqd-buttonicon">
              <div className="lqd-icon">
                <svg className="lqd-icon-svg icon-arrow-down" aria-hidden="true">
                  <use xlinkHref="../../images/icons.svg#icon-arrow-down"></use>
                </svg>
              </div>
            </button>
            <ul className="lqd-select-dropdown hidden-all" onChange={(newValue) => { this._onChange(newValue.target, this.props.name); }}>
              {this.props.options ? this.props.options.map(o => (
                <li data-value={o.Title}>{o.Title}</li>
              )) : null}
            </ul>
          </div>
        </>
      );
    } catch (err) {
      Logger.write(`${err} - ${this.LOG_SOURCE} (render)`, LogLevel.Error);
      return null;
    }
  }
}