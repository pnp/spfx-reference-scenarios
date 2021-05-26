import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";
import styles from "../WorldClock.module.scss";
import { Icons } from "../../models/wc.Icons";

export interface ISearchBoxProps {
  name: string;
  value: string;
  placeholder?: string;
  onChange: (fieldValue: string, fieldName: string) => void;
}

export interface ISearchBoxState { }

export class SearchBoxState implements ISearchBoxState {
  constructor() { }
}

export default class SearchBox extends React.Component<ISearchBoxProps, ISearchBoxState> {
  private LOG_SOURCE: string = "🔶SearchBox";

  constructor(props: ISearchBoxProps) {
    super(props);
    this.state = new SearchBoxState();
  }

  public shouldComponentUpdate(nextProps: ISearchBoxProps, nextState: ISearchBoxState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _onChange = (newValue: string, fieldName: string) => {
    try {
      this.props.onChange(newValue, fieldName);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onChange) - ${err}`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<ISearchBoxProps> {
    try {
      return (
        <div className="hoo-input-search">
          <span className={`icon ${Icons.Search.Class}`} aria-hidden="true" dangerouslySetInnerHTML={{ "__html": Icons.Search.SVG }} >
          </span>
          <input
            className="hoo-input-text"
            name={this.props.name}
            type="text"
            value={this.props.value}
            placeholder={this.props.placeholder}
            autoComplete="off"
            onChange={(newValue) => { this._onChange(newValue.target.value, this.props.name); }} />
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}