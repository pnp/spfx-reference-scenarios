import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { chain, cloneDeep, Dictionary, find, groupBy, isEqual, merge, sortBy } from "lodash";
import Dialog from "../molecules/Dialog";
import strings from "WorldClockWebPartStrings";
import ManageViews from "../molecules/ManageViews";
import { IPerson, ISchedule, IView, Person, View } from "../../models/wc.models";
import { wc } from "../../services/wc.service";
import TimeCard from "../molecules/TimeCard";
import { DateTime } from "luxon";
import Profile from "../molecules/Profile";

export interface ITeamTimesProps {
  userId: string;
  currentTime: DateTime;
  addToMeeting: (IPerson) => void;
  meetingMembers: IPerson[];
}

export interface ITeamTimesState {
  needsConfig: boolean;
  manageViewsVisible: boolean;
  views: IView[];
  timeZoneView: any[];
  showProfile: boolean;
}

export class TeamTimesState implements ITeamTimesState {
  constructor(
    public needsConfig: boolean = false,
    public manageViewsVisible: boolean = false,
    public views: IView[] = [],
    public timeZoneView: any[] = [],
    public showProfile: boolean = false,
  ) { }
}

export default class TeamTimes extends React.Component<ITeamTimesProps, ITeamTimesState> {
  private LOG_SOURCE: string = "🔶 TeamTimes";

  constructor(props: ITeamTimesProps) {
    super(props);
    try {
      //TODO: Julie I need some help with the best way to do this.
      let timeZoneView: any[];
      let needsConfig = false;
      if ((wc.Config.members.length > 20) && (wc.Config.views.length == 0)) {
        needsConfig = true;
      } else {
        let defaultView: IView = wc.Config.views[wc.Config.defaultViewId];
        let members: IPerson[] = defaultView.members;
        timeZoneView = chain(members).groupBy("offset").map((value, key) => ({ offset: parseInt(key.toString()), members: value })).sortBy("offset").value();
        let dayTimeArray: any[] = [];
        for (let key in timeZoneView) {
          let groupMembers: IPerson[] = timeZoneView[key].members as IPerson[];
          let currentTime: DateTime = this.props.currentTime.setZone(groupMembers[0].IANATimeZone);
          let timeStyle: string = "";
          if (currentTime.hour > 6 && currentTime.hour <= 7) {
            timeStyle = "hoo-wcs-day";
          } else if (currentTime.hour > 7 && currentTime.hour <= 19) {
            timeStyle = "hoo-wcs-day";
          }
          else {
            timeStyle = "hoo-wcs-night";
          }
          dayTimeArray.push({ style: timeStyle, offset: timeZoneView[key].offset, members: timeZoneView[key].members });
        }
        timeZoneView = chain(dayTimeArray).groupBy("style").map((value, key) => ({ style: key, cardItems: value })).value();
      }
      this.state = new TeamTimesState(needsConfig, needsConfig, wc.Config.views, timeZoneView);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (constructor) - ${err}`, LogLevel.Error);
    }

  }

  public shouldComponentUpdate(nextProps: Readonly<ITeamTimesProps>, nextState: Readonly<ITeamTimesState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }
  private _changeManageViewsVisibility = (visible: boolean): void => {
    this.setState({ manageViewsVisible: visible, needsConfig: false });
  }
  private _showProfile = (visible: boolean): void => {
    this.setState({ showProfile: visible });
  }

  private _saveView = async (view: IView): Promise<void> => {
    try {
      let success: boolean = false;
      const views = cloneDeep(this.state.views);
      let a = find(views, { viewId: view.viewId });
      if (a) {
        merge(a, view);
      } else {
        view.viewId = views.length.toString();
        views.push(view);
      }
      const config = cloneDeep(wc.Config);
      config.views = views;
      success = await wc.updateConfig(config);
      if (success) {
        this.setState({ manageViewsVisible: false, views: config.views });
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_saveView) - ${err}`, LogLevel.Error);
    }
  }

  private _cancelView = () => {
    try {
      this._changeManageViewsVisibility(false);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_cancelView) - ${err}`, LogLevel.Error);
    }
  }
  private _saveProfile = async (schedule: ISchedule): Promise<void> => {
    try {
      let success: boolean = false;
      const config = cloneDeep(wc.Config);
      let user = find(config.members, { personId: this.props.userId });
      if (user) {
        user.schedule = schedule;
      }
      success = await wc.updateConfig(config);
      if (success) {
        this.setState({ showProfile: false });
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_saveView) - ${err}`, LogLevel.Error);
    }
  }

  private _cancelProfile = () => {
    try {
      this._showProfile(false);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_cancelView) - ${err}`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<ITeamTimesProps> {
    try {
      let currentUser: IPerson = find(wc.Config.members, { personId: this.props.userId });
      return (
        <div data-component={this.LOG_SOURCE}>
          <div className="hoo-wcs">
            {this.state.timeZoneView.map((m, index) => {
              return (<div className={`${m.style} ${(index == 0) ? "first" : (index == this.state.timeZoneView.length - 1) ? "last" : ""}`}>
                {m.cardItems.map((ci) => {
                  let members: IPerson[] = ci.members as IPerson[];
                  return (<TimeCard userId={this.props.userId} members={members} currentTimeZone={wc.IANATimeZone} currentTime={this.props.currentTime} addToMeeting={this.props.addToMeeting} meetingMembers={this.props.meetingMembers} editProfile={this._showProfile} />);
                })}
              </div>);

            })}
          </div>
          <Dialog header={(this.state.needsConfig) ? strings.ConfigureViewsTitle : strings.ManageViewsTitle} content={(this.state.needsConfig) ? strings.ConfigureViewsContent : strings.ManageViewsContent} visible={this.state.manageViewsVisible} onChange={this._changeManageViewsVisibility} height={70} width={60}>
            <ManageViews views={this.state.views} save={this._saveView} cancel={this._cancelView} />
          </Dialog>
          <Dialog header="Edit Profile" content="Edit your profile to show your working days and hours" visible={this.state.showProfile} onChange={this._showProfile} height={70} width={60}>
            <Profile user={currentUser} save={this._saveProfile} cancel={this._cancelProfile} />
          </Dialog>
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}