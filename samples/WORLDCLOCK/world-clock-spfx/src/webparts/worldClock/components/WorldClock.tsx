import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import cloneDeep from "lodash/cloneDeep";
import find from "lodash/find";
import remove from "lodash/remove";
import uniqBy from "lodash/uniqBy";
import sortBy from "lodash/sortBy";

import TeamTimes from "./organisms/TeamTimes";
import MeetingScheduler from "./organisms/MeetingScheduler";
import styles from "./WorldClock.module.scss";
import { wc } from "../services/wc.service";
import { IPerson } from "../models/wc.models";

export interface IWorldClockProps {
  view: string;
  loading: boolean;
}


export interface IWorldClockState {
  meetingMembers: IPerson[];
}

export class WorldClockState implements IWorldClockState {
  constructor(
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
    try {
      let meetingMembers = cloneDeep(this.state.meetingMembers);
      if (meetingMembers.length == 0) {
        meetingMembers.push(wc.CurrentUser);
      }
      meetingMembers.push(person);
      meetingMembers = uniqBy(meetingMembers, "personId");
      meetingMembers = sortBy(meetingMembers, "offset");
      //meetingMembers = chain(meetingMembers).uniqBy("personId").sortBy("offset").value();
      this.setState({ meetingMembers: meetingMembers });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_addToMeeting) - ${err}`, LogLevel.Error);
    }
  }

  private _removefromMeeting = (person: IPerson) => {
    try {
      let meetingMembers = cloneDeep(this.state.meetingMembers);
      meetingMembers.map((m) => {
        if (m.personId == person.personId) {
          remove(meetingMembers, person);
        }
      });
      meetingMembers = uniqBy(meetingMembers, "personId");
      meetingMembers = sortBy(meetingMembers, "offset");
      //meetingMembers = chain(meetingMembers).uniqBy("personId").sortBy("offset").value();
      this.setState({ meetingMembers: meetingMembers });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_removefromMeeting) - ${err}`, LogLevel.Error);
    }
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
          {this.props.loading &&
            <div className="hoo-wcs">
              <div className="hoo-wc-clock hoo-ph-primary hoo-ph-squared"></div>
              <div className="hoo-wc-clock hoo-ph-primary hoo-ph-squared"></div>
              <div className="hoo-wc-clock hoo-ph-primary hoo-ph-squared"></div>
            </div>
          }
          {!this.props.loading &&
            <>
              <TeamTimes
                addToMeeting={this._addToMeeting}
                meetingMembers={this.state.meetingMembers}
                saveProfile={this._saveProfile}
                view={this.props.view} />
              {(this.state.meetingMembers.length > 0) &&
                <MeetingScheduler
                  meetingMembers={this.state.meetingMembers}
                  currentUser={wc.CurrentUser}
                  removeFromMeeting={this._removefromMeeting} />
              }
            </>
          }
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}