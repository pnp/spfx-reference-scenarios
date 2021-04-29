import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";
import TeamTimes from "./organisms/TeamTimes";
import MeetingScheduler from "./organisms/MeetingScheduler";
import styles from "./WorldClock.module.scss";
import { DateTime } from "luxon";
import { wc } from "../services/wc.service";

export interface IWorldClockProps {
  userId: number;
}

export interface IWorldClockState {
  currentTime: DateTime;
}

export class WorldClockState implements IWorldClockState {
  constructor(
    public currentTime: DateTime = DateTime.now().setLocale(wc.Locale).setZone(wc.IANATimeZone)
  ) { }
}

export default class WorldClock extends React.Component<IWorldClockProps, IWorldClockState> {
  private LOG_SOURCE: string = "🔶 WorldClock";

  constructor(props: IWorldClockProps) {
    super(props);
    this.updateCurrentTime();
    this.state = new WorldClockState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IWorldClockProps>, nextState: Readonly<IWorldClockState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private async delay(ms: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  public async updateCurrentTime(): Promise<void> {
    while (true) {
      const delay: number = (1000);
      await this.delay(delay);
      let now: DateTime = await DateTime.now().setLocale(wc.Locale).setZone(wc.IANATimeZone);
      this.setState({ currentTime: now });
    }
  }

  public render(): React.ReactElement<IWorldClockProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className={styles.worldClock}>
          <TeamTimes userId={this.props.userId} currentTime={this.state.currentTime} />
          <MeetingScheduler />
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}