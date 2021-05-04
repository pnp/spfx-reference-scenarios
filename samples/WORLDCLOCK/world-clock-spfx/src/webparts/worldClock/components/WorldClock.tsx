import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";
import TeamTimes from "./organisms/TeamTimes";
import MeetingScheduler from "./organisms/MeetingScheduler";
import styles from "./WorldClock.module.scss";
import { DateTime, IANAZone } from "luxon";
import { wc } from "../services/wc.service";
import { IPerson, ISchedule, Person } from "../models/wc.models";
import { chain, cloneDeep, find, reduce, remove, uniqBy } from "lodash";

export interface IWorldClockProps {
  userId: string;
}

export interface IWorldClockState {
  currentUser: IPerson;
  currentTime: DateTime;
  meetingMembers: IPerson[];
}

export class WorldClockState implements IWorldClockState {
  constructor(
    public currentUser: IPerson = new Person,
    public currentTime: DateTime = DateTime.now().setLocale(wc.Locale).setZone(wc.IANATimeZone),
    public meetingMembers: IPerson[] = [],
  ) { }
}

export default class WorldClock extends React.Component<IWorldClockProps, IWorldClockState> {
  private LOG_SOURCE: string = "🔶 WorldClock";

  constructor(props: IWorldClockProps) {
    super(props);
    this.updateCurrentTime();
    let currentUser: IPerson = find(wc.Config.members, { personId: this.props.userId });
    this.state = new WorldClockState(currentUser);
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
      const delay: number = (60000);
      await this.delay(delay);
      let now: DateTime = await DateTime.now().setLocale(wc.Locale).setZone(wc.IANATimeZone);
      this.setState({ currentTime: now });
    }
  }

  private _addToMeeting = (person: IPerson) => {
    let meetingMembers = cloneDeep(this.state.meetingMembers);
    if (meetingMembers.length == 0) {
      let user: IPerson = find(wc.Config.members, { personId: this.state.currentUser.personId });
      meetingMembers.push(user);
    }
    meetingMembers.push(person);
    meetingMembers = chain(meetingMembers).uniqBy("personId").sortBy("offset").value();
    this.setState({ meetingMembers: meetingMembers });
  }
  private _removefromMeeting = (person: IPerson) => {
    let meetingMembers = cloneDeep(this.state.meetingMembers);
    meetingMembers.map((m) => {
      if (m.personId == person.personId) {
        remove(meetingMembers, person);
      }
    });
    meetingMembers = chain(meetingMembers).uniqBy("personId").sortBy("offset").value();
    this.setState({ meetingMembers: meetingMembers });
  }

  private _saveProfile = async (schedule: ISchedule): Promise<boolean> => {
    let success: boolean = false;
    try {
      const config = cloneDeep(wc.Config);
      let user = find(config.members, { personId: this.state.currentUser.personId });
      if (user) {
        user.schedule = schedule;
      }
      success = await wc.updateConfig(config);
      if (success) {
        let currentUserInMeeting = find(this.state.meetingMembers, { personId: this.state.currentUser.personId });
        if (currentUserInMeeting) {
          const meetingMembers = cloneDeep(this.state.meetingMembers);
          meetingMembers.map((m, index) => {
            if (m.personId == currentUserInMeeting.personId) {
              meetingMembers[index] = user;
            }
          });
          this.setState({ currentUser: user, meetingMembers: meetingMembers });
        } else {
          this.setState({ currentUser: user });
        }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_saveView) - ${err}`, LogLevel.Error);
    }
    return success;
  }

  public render(): React.ReactElement<IWorldClockProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className={styles.worldClock}>
          <TeamTimes currentUser={this.state.currentUser} currentTime={this.state.currentTime} addToMeeting={this._addToMeeting} meetingMembers={this.state.meetingMembers} saveProfile={this._saveProfile} />
          {(this.state.meetingMembers.length > 0) ? <MeetingScheduler meetingMembers={this.state.meetingMembers} currentUser={this.state.currentUser} removeFromMeeting={this._removefromMeeting} /> : null}

        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}