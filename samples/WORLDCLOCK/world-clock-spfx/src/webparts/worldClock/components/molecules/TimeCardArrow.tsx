import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";

import ButtonIcon from "../atoms/ButtonIcon";
import { IIconType } from "../../models/wc.Icons";

export interface ITimeCardArrowProps {
  iconType: IIconType;
  altText: string;
  onClick: (shift: number) => void;
  direction: Direction;
}
export enum Direction {
  "Forward" = 1,
  "Backward" = -1
}

export interface ITimeCardArrowState {
}

export class TimeCardArrowState implements ITimeCardArrowState {
  constructor() { }
}

export default class TimeCardArrow extends React.Component<ITimeCardArrowProps, ITimeCardArrowState> {
  private LOG_SOURCE: string = "🔶 TimeCardArrow";

  constructor(props: ITimeCardArrowProps) {
    super(props);
    this.state = new TimeCardArrowState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ITimeCardArrowProps>, nextState: Readonly<ITimeCardArrowState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ITimeCardArrowProps> {
    try {

      return (
        <div data-component={this.LOG_SOURCE}>
          <div className="hoo-wc-clock partial">
            <div className="center-vertical">
              <ButtonIcon
                iconType={this.props.iconType}
                altText={this.props.altText}
                onClick={() => this.props.onClick(this.props.direction)} />
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