import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "lodash";
import styles from '../CovidForm.module.scss';
import { IQuestion } from "../../covid.model";

export interface IButtonProps {
  className: string;
  disabled: boolean;
  label: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export interface IButtonState {
}

export class ButtonState implements IButtonState {
  constructor() { }
}

export default class Button extends React.Component<IButtonProps, IButtonState> {
  private LOG_SOURCE: string = "🔶Button";

  constructor(props: IButtonProps) {
    super(props);
    this.state = new ButtonState();
  }

  public shouldComponentUpdate(nextProps: IButtonProps, nextState: IButtonState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IButtonProps> {
    try {
      return (
        <button className={this.props.className} disabled={this.props.disabled} aria-disabled={this.props.disabled} onClick={this.props.onClick}>
          <div className="lqd-button-label">{this.props.label}</div>
        </button>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}