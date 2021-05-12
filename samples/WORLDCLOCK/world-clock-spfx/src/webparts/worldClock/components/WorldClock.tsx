import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";
import TeamTimes from "./organisms/TeamTimes";
import MeetingScheduler from "./organisms/MeetingScheduler";
import styles from "./WorldClock.module.scss";
import { DateTime } from "luxon";
import { wc } from "../services/wc.service";
import { IPerson, ISchedule, Person } from "../models/wc.models";
import { chain, cloneDeep, find, reduce, remove, uniqBy } from "lodash";
import { IMicrosoftTeams } from "@microsoft/sp-webpart-base";

export interface IWorldClockProps {
  teamsContext: IMicrosoftTeams;
}

export interface IWorldClockState {
  //currentUser: IPerson;
  //currentTime: DateTime;
  meetingMembers: IPerson[];
}

export class WorldClockState implements IWorldClockState {
  constructor(
    //public currentUser: IPerson = new Person,
    public meetingMembers: IPerson[] = [],
  ) { }
}

export default class WorldClock extends React.Component<IWorldClockProps, IWorldClockState> {
  private LOG_SOURCE: string = "🔶 WorldClock";

  constructor(props: IWorldClockProps) {
    super(props);
    this.state = new WorldClockState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IWorldClockProps>, nextState: Readonly<IWorldClockState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _addToMeeting = (person: IPerson) => {
    let meetingMembers = cloneDeep(this.state.meetingMembers);
    if (meetingMembers.length == 0) {
      //let user: IPerson = find(wc.Config.members, { personId: this.state.currentUser.personId });
      meetingMembers.push(wc.CurrentUser);
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

  private _saveProfile = async (person: IPerson): Promise<boolean> => {
    let success: boolean = false;
    try {

      success = await wc.UpdateMember(person);
      if (success) {
        let currentUserInMeeting = find(this.state.meetingMembers, { personId: wc.CurrentUser.personId });
        if (currentUserInMeeting) {
          const meetingMembers = cloneDeep(this.state.meetingMembers);
          meetingMembers.map((m, index) => {
            if (m.personId == currentUserInMeeting.personId) {
              meetingMembers[index] = person;
            }
          });
          this.setState({ meetingMembers: meetingMembers });
        }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_saveProfile) - ${err}`, LogLevel.Error);
    }
    return success;
  }

  public render(): React.ReactElement<IWorldClockProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className={styles.worldClock}>
          <TeamTimes
            //currentUser={wc.CurrentUser}
            //currentTime={this.state.currentTime}
            addToMeeting={this._addToMeeting}
            meetingMembers={this.state.meetingMembers}
            saveProfile={this._saveProfile} />
          {(this.state.meetingMembers.length > 0) &&
            <MeetingScheduler
              meetingMembers={this.state.meetingMembers}
              currentUser={wc.CurrentUser}
              removeFromMeeting={this._removefromMeeting}
              teamsContext={this.props.teamsContext} />
          }
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}