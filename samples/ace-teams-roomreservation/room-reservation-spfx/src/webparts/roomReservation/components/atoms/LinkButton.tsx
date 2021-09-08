import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "@microsoft/sp-lodash-subset";

export interface ILinkButtonProps {
  className: string;
  disabled: boolean;
  label: string;
  linkUrl: string;
  newWindow: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export interface ILinkButtonState {
}

export class LinkButtonState implements ILinkButtonState {
  constructor() { }
}

export default class Button extends React.Component<ILinkButtonProps, ILinkButtonState> {
  private LOG_SOURCE: string = "🔶 LinkButton";

  constructor(props: ILinkButtonProps) {
    super(props);
    this.state = new LinkButtonState();
  }

  public shouldComponentUpdate(nextProps: ILinkButtonProps, nextState: ILinkButtonState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ILinkButtonProps> {
    try {
      return (
        <button className={this.props.className} disabled={this.props.disabled} aria-disabled={this.props.disabled} onClick={this.props.onClick}>
          <a href={this.props.linkUrl} target={(this.props.newWindow) ? "_blank" : ""} className="hoo-button-label">{this.props.label}</a>
        </button>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}