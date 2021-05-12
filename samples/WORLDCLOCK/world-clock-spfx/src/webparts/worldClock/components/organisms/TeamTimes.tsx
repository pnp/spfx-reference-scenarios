import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { chain, cloneDeep, find, isEqual, remove } from "lodash";
import Dialog from "../molecules/Dialog";
import strings from "WorldClockWebPartStrings";
import ManageViews from "../molecules/ManageViews";
import { IPerson, IWCView } from "../../models/wc.models";
import { wc } from "../../services/wc.service";
import TimeCard from "../molecules/TimeCard";
import { DateTime } from "luxon";
import Profile from "../molecules/Profile";
import { Icons } from "../../models/wc.Icons";
import styles from "../WorldClock.module.scss";
import ButtonSplitPrimary, { IButtonOption } from "../atoms/ButtonSplitPrimary";
import ManageMembers from "../molecules/ManageMembers";
import Button from "../atoms/Button";

export interface ITeamTimesProps {
  //currentUser: IPerson;
  //currentTime: DateTime;
  addToMeeting: (IPerson) => void;
  meetingMembers: IPerson[];
  saveProfile: (person: IPerson) => Promise<boolean>;
}

export interface ITeamTimesState {
  needsConfig: boolean;
  showManageViews: boolean;
  views: IWCView[];
  currentView: string;
  timeZoneView: any[];
  viewOptions: IButtonOption[];
  showProfile: boolean;
  currentTime: DateTime;
  showManageMembers: boolean;
  profileUser: IPerson;
}

export class TeamTimesState implements ITeamTimesState {
  constructor(
    public needsConfig: boolean = false,
    public showManageViews: boolean = false,
    public views: IWCView[] = [],
    public currentView: string = null,
    public timeZoneView: any[] = [],
    public viewOptions: IButtonOption[] = [],
    public showProfile: boolean = false,
    public currentTime: DateTime = DateTime.now().setLocale(wc.Locale).setZone(wc.IANATimeZone),
    public showManageMembers: boolean = false,
    public profileUser: IPerson = wc.CurrentUser,
  ) { }
}

export default class TeamTimes extends React.Component<ITeamTimesProps, ITeamTimesState> {
  private LOG_SOURCE: string = "🔶 TeamTimes";

  constructor(props: ITeamTimesProps) {
    super(props);
    try {
      let timeZoneView: any[];
      let needsConfig = false;
      if ((wc.Config.members.length > 20) && (wc.Config.views.length == 0)) {
        needsConfig = true;
      } else {
        let defaultView: IWCView = wc.Config.views[wc.Config.defaultViewId];
        timeZoneView = this._sortTimeZones(defaultView);
      }
      let options: IButtonOption[] = this._getManageViewOptions();
      this.state = new TeamTimesState(needsConfig, needsConfig, wc.Config.views, (needsConfig) ? null : wc.Config.defaultViewId, timeZoneView, options);
      this.updateCurrentTime();
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (constructor) - ${err}`, LogLevel.Error);
    }

  }

  public shouldComponentUpdate(nextProps: Readonly<ITeamTimesProps>, nextState: Readonly<ITeamTimesState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public componentDidUpdate() {
    if (wc.Refresh) {
      wc.Refresh = false;
      const timeZoneView = this._sortTimeZones(wc.Config.views[this.state.currentView]);
      this.setState({ timeZoneView });
    }
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

  private _changeManageViewsVisibility = (visible: boolean): void => {
    this.setState({ showManageViews: visible, needsConfig: false });
  }

  private _sortTimeZones(view: IWCView) {
    let timeZoneView: any[];
    try {
      const currentTime: DateTime = this.state?.currentTime || DateTime.now().setLocale(wc.Locale).setZone(wc.IANATimeZone);
      let members: IPerson[] = wc.GetTeamMembers(view.members);
      timeZoneView = chain(members).groupBy("offset").map((value, key) => ({ offset: parseInt(key.toString()), members: value })).sortBy("offset").value();
      let dayTimeArray: any[] = [];
      for (let key in timeZoneView) {
        let groupMembers: IPerson[] = timeZoneView[key].members as IPerson[];
        let tzCurrentTime: DateTime = currentTime.setZone(groupMembers[0].IANATimeZone);
        let timeStyle: string = "";
        if (tzCurrentTime.hour > 6 && tzCurrentTime.hour <= 7) {
          timeStyle = "hoo-wcs-day";
        } else if (tzCurrentTime.hour > 7 && tzCurrentTime.hour <= 19) {
          timeStyle = "hoo-wcs-day";
        }
        else {
          timeStyle = "hoo-wcs-night";
        }
        dayTimeArray.push({ style: timeStyle, offset: timeZoneView[key].offset, members: timeZoneView[key].members });
      }
      timeZoneView = chain(dayTimeArray).groupBy("style").map((value, key) => ({ style: key, cardItems: value })).value();
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_sortTimeZones) - ${err}`, LogLevel.Error);
    }
    return timeZoneView;
  }
  private _showManageMembers = (visible: boolean): void => {
    this.setState({ showManageMembers: visible });
  }
  private _showProfile = (visible: boolean): void => {
    this.setState({ showProfile: visible });
  }

  private _saveView = async (view: IWCView, isDefault: boolean): Promise<void> => {
    try {
      let success: boolean = false;
      const config = cloneDeep(wc.Config);
      let a = find(config.views, { viewId: view.viewId });

      if (a) {
        config.views.map((v, index) => {
          if (v.viewId == a.viewId) {
            config.views[index] = view;
          }
        });
      } else {
        view.viewId = config.views.length.toString();
        config.views.push(view);
      }
      if (isDefault) {
        config.defaultViewId = view.viewId;
      }
      success = await wc.UpdateConfig(config);
      if (success) {
        let timeZoneView = this._sortTimeZones(view);
        let options: IButtonOption[] = this._getManageViewOptions();
        this.setState({ showManageViews: false, views: config.views, timeZoneView: timeZoneView, viewOptions: options, currentView: view.viewId });
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_saveView) - ${err}`, LogLevel.Error);
    }
  }

  private _deleteView = async (view: IWCView): Promise<void> => {
    try {
      let success: boolean = false;
      const config = cloneDeep(wc.Config);
      let a = find(config.views, { viewId: view.viewId });

      if (a) {
        remove(config.views, a);
        a = config.views[config.defaultViewId];
      }
      success = await wc.UpdateConfig(config);
      if (success) {
        let options: IButtonOption[] = this._getManageViewOptions();
        if (wc.Config.views.length > 0) {
          let timeZoneView = this._sortTimeZones(a);
          this.setState({ showManageViews: false, views: config.views, timeZoneView: timeZoneView, viewOptions: options, currentView: a.viewId });
        } else {
          this.setState({ showManageViews: false, views: config.views, timeZoneView: [], viewOptions: options, currentView: "" });
        }


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

  private _addMember = async (person: IPerson): Promise<void> => {
    try {
      let success: boolean = false;
      success = await wc.AddMember(person);
      if (success) {
        wc.Refresh = true;
        this._updateCurrentView();
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_saveView) - ${err}`, LogLevel.Error);
    }
  }

  private _saveMember = async (person: IPerson): Promise<void> => {
    try {
      let success: boolean = false;
      success = await this.props.saveProfile(person);
      if (success) {
        wc.Refresh = true;
        this._updateCurrentView();
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_saveView) - ${err}`, LogLevel.Error);
    }
  }

  private _removeMember = async (person: IPerson): Promise<void> => {
    try {
      let success: boolean = false;
      success = wc.RemoveTeamMember(person);
      if (success) {
        wc.Refresh = true;
        this._updateCurrentView();
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_removeMember) - ${err}`, LogLevel.Error);
    }
  }

  private _updateCurrentView = () => {
    try {
      const config = cloneDeep(wc.Config);
      let v = find(config.views, { viewId: this.state.currentView });
      let timeZoneView = this._sortTimeZones(v);
      this.setState({ timeZoneView: timeZoneView, showProfile: false });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_updateCurrentView) - ${err}`, LogLevel.Error);
    }
  }

  private _cancelProfile = () => {
    try {
      this._showProfile(false);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_cancelView) - ${err}`, LogLevel.Error);
    }
  }

  private _getManageViewOptions() {
    let options: IButtonOption[] = [];
    wc.Config.views.map((v) => {
      options.push({ iconType: Icons.TeamView, label: v.viewName, onClick: this._changeView });
    });
    options.push({ iconType: Icons.Plus, label: strings.AddEditViewLabel, onClick: this._addNewView });
    return options;
  }
  private _changeView = (viewName: string) => {
    try {
      const views = cloneDeep(this.state.views);
      let v = find(views, { viewName: viewName });
      let timeZoneView = this._sortTimeZones(v);
      this.setState({ timeZoneView: timeZoneView, currentView: v.viewId });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_changeView) - ${err}`, LogLevel.Error);
    }
  }
  private _addNewView = (viewName: string) => {
    try {
      this._changeManageViewsVisibility(true);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_changeView) - ${err}`, LogLevel.Error);
    }
  }

  private _editProfile = (person: IPerson) => {
    this.setState({ profileUser: person, showProfile: true });
  }

  public render(): React.ReactElement<ITeamTimesProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE}>
          <div className={styles.isRight}>
            <Button className="hoo-button-primary" disabled={false} label={strings.ManageMembersTitle} onClick={() => this._showManageMembers(true)} />
            <ButtonSplitPrimary className={styles.managebutton} label={(this.state.currentView) ? this.state.views[this.state.currentView].viewName : strings.ManageViewsLabel} options={this.state.viewOptions} />
          </div>
          <div className="hoo-wcs">
            {this.state.timeZoneView.map((m, index) => {
              return (<div className={`${m.style} ${(index == 0) ? "first" : (index == this.state.timeZoneView.length - 1) ? "last" : ""}`}>
                {m.cardItems.map((ci) => {
                  let members: IPerson[] = ci.members as IPerson[];
                  return (<TimeCard
                    userId={wc.CurrentUser.personId}
                    members={members}
                    currentTimeZone={wc.IANATimeZone}
                    currentTime={this.state.currentTime}
                    addToMeeting={this.props.addToMeeting}
                    meetingMembers={this.props.meetingMembers}
                    editProfile={this._showProfile} />);
                })}
              </div>);
            })}
          </div>
          {this.state.showManageViews &&
            <Dialog
              header={(this.state.needsConfig) ? strings.ConfigureViewsTitle : strings.ManageViewsTitle}
              content={(this.state.needsConfig) ? strings.ConfigureViewsContent : strings.ManageViewsContent}
              visible={this.state.showManageViews}
              onChange={this._changeManageViewsVisibility}
              height={90}
              width={90}>
              <ManageViews
                save={this._saveView}
                cancel={this._cancelView}
                delete={this._deleteView} />
            </Dialog>
          }
          {this.state.showManageMembers &&
            <Dialog
              header={strings.ManageMembersTitle}
              content={strings.ManageMembersContent}
              visible={this.state.showManageMembers}
              onChange={this._showManageMembers}
              height={90}
              width={90}>
              <ManageMembers
                save={this._saveMember}
                remove={this._removeMember}
                add={this._addMember}
                edit={this._editProfile} />
            </Dialog>
          }
          {this.state.showProfile &&
            <Dialog
              header={strings.EditProfileTitle}
              content={strings.EditProfileContent}
              visible={this.state.showProfile}
              onChange={this._showProfile}
              height={95}
              width={95}>
              <Profile
                user={this.state.profileUser}
                save={this._saveMember}
                cancel={this._cancelProfile} />
            </Dialog>
          }


        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}