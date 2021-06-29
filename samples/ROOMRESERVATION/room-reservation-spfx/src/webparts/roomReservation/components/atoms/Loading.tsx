import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";
import styles from '../RoomReservation.module.scss';

export interface ILoadingProps {
}

export interface ILoadingState {
}

export class LoadingState implements ILoadingState {
  constructor() { }
}

export default class Loading extends React.Component<ILoadingProps, ILoadingState> {
  private LOG_SOURCE: string = "🔶Loading";

  constructor(props: ILoadingProps) {
    super(props);
    this.state = new LoadingState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ILoadingProps>, nextState: Readonly<ILoadingState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ILoadingProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className={`${styles.roomReservation} hoo-ph-primary`}>
          <ul className="meeting-datelist">

            <li className="meeting-date hoo-ph-primary hoo-ph-squared">
              <div className="date-details">
                <div className="date-title">&nbsp;</div>
                <div className="date-day">&nbsp;</div>
                <div className="date-room">&nbsp;</div>
                <div className="date-persons">&nbsp;</div>
              </div>
            </li>
            <li className="meeting-date hoo-ph-primary hoo-ph-squared">
              <div className="date-details">
                <div className="date-title">&nbsp;</div>
                <div className="date-day">&nbsp;</div>
                <div className="date-room">&nbsp;</div>
                <div className="date-persons">&nbsp;</div>
              </div>
            </li>
            <li className="meeting-date hoo-ph-primary hoo-ph-squared">
              <div className="date-details">
                <div className="date-title">&nbsp;</div>
                <div className="date-day">&nbsp;</div>
                <div className="date-room">&nbsp;</div>
                <div className="date-persons">&nbsp;</div>
              </div>
            </li>
            <li className="meeting-date hoo-ph-primary hoo-ph-squared">
              <div className="date-details">
                <div className="date-title">&nbsp;</div>
                <div className="date-day">&nbsp;</div>
                <div className="date-room">&nbsp;</div>
                <div className="date-persons">&nbsp;</div>
              </div>
            </li>
          </ul>
        </div>

      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}