import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { chain, cloneDeep, find, isEqual, remove, forEach, round, indexOf } from "lodash";
import Dialog from "../molecules/Dialog";
import strings from "WorldClockWebPartStrings";
import ManageViews from "../molecules/ManageViews";
import { IPerson, IWCView, ITimeZoneView } from "../../models/wc.models";
import { wc } from "../../services/wc.service";
import TimeCard from "../molecules/TimeCard";
import { DateTime } from "luxon";
import Profile from "../molecules/Profile";
import { Icons } from "../../models/wc.Icons";
import styles from "../WorldClock.module.scss";
import ButtonSplitPrimary, { IButtonOption } from "../atoms/ButtonSplitPrimary";
import ManageMembers from "../molecules/ManageMembers";
import Button from "../atoms/Button";
import TimeCardArrow, { Direction } from "../molecules/TimeCardArrow";

export interface ITeamTimesProps {
  meetingMembers: IPerson[];
  addToMeeting: (IPerson) => void;
  saveProfile: (person: IPerson) => Promise<boolean>;
}

export interface ITeamTimesState {
  needsConfig: boolean;
  showManageViews: boolean;
  views: IWCView[];
  currentView: string;
  timeZoneView: ITimeZoneView[];
  viewOptions: IButtonOption[];
  showProfile: boolean;
  currentTime: DateTime;
  showManageMembers: boolean;
  profileUser: IPerson;
  timeCardContainerWidth: number;
  startTimeCardIndex: number;
  totalTimeCards: number;
  maxTimeCards: number;
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
    public timeCardContainerWidth: number = null,
    public startTimeCardIndex: number = 0,
    public totalTimeCards: number = 0,
    public maxTimeCards: number = 0
  ) { }
}

export default class TeamTimes extends React.Component<ITeamTimesProps, ITeamTimesState> {
  private LOG_SOURCE: string = "🔶 TeamTimes";
  private _ready: boolean = false;
  private _timeCardResize: ResizeObserver;
  private _timeCardContainer: React.RefObject<HTMLDivElement>;

  constructor(props: ITeamTimesProps) {
    super(props);
    try {
      this._timeCardResize = new ResizeObserver(this._resizeObserverHandler);
      this._timeCardContainer = React.createRef<HTMLDivElement>();

      let needsConfig = false;

      if ((wc.Config.members.length > 20) && (wc.Config.views.length == 0)) {
        needsConfig = true;
      }
      let options: IButtonOption[] = this._getManageViewOptions();
      this.state = new TeamTimesState(needsConfig, needsConfig, wc.Config.views, (needsConfig) ? null : wc.Config.defaultViewId, [], options);
      this.updateCurrentTime();
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (constructor) - ${err}`, LogLevel.Error);
    }
  }

  public componentDidMount() {
    try {
      wc.ConfigRefresh = this._handleRefresh;
      if (this._timeCardContainer.current != undefined) {
        this._timeCardResize.observe(this._timeCardContainer.current, { box: "border-box" });
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (componentDidMount) - ${err}`, LogLevel.Error);
    }

  }

  public shouldComponentUpdate(nextProps: Readonly<ITeamTimesProps>, nextState: Readonly<ITeamTimesState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _resizeObserverHandler: ResizeObserverCallback = () => {
    try {
      const timeCardContainerWidth = this._timeCardContainer.current.clientWidth;
      this.setState({ timeCardContainerWidth },
        () => {
          this._shiftTimeCards(0);
        });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_resizeObserverHandler) - ${err}`, LogLevel.Error);
    }
  }

  private _handleRefresh = (newState?: any) => {
    try {
      const [timeZoneView, totalTimeCards] = this._sortTimeZones(wc.Config.views[this.state.currentView], this.state.startTimeCardIndex, this.state.maxTimeCards);
      if (newState == undefined) {
        newState = { timeZoneView, totalTimeCards };
      } else {
        newState.timeZoneView = timeZoneView;
        newState.totalTimeCards = totalTimeCards;
      }
      this.setState(newState);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_handleRefresh) - ${err}`, LogLevel.Error);
    }
  }

  private async delay(ms: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async updateCurrentTime(): Promise<void> {
    try {
      while (true) {
        const delay: number = (60000);
        await this.delay(delay);
        let now: DateTime = await DateTime.now().setLocale(wc.Locale).setZone(wc.IANATimeZone);
        if (!this._ready && wc.Ready) {
          this._ready = true;
          this._handleRefresh({ currentTime: now });
        } else {
          this.setState({ currentTime: now });
        }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (updateCurrentTime) - ${err}`, LogLevel.Error);
    }
  }

  private _changeManageViewsVisibility = (visible: boolean): void => {
    this.setState({ showManageViews: visible, needsConfig: false });
  }

  private _sortTimeZones(view: IWCView, startIndex: number = 0, maxCards: number): [ITimeZoneView[], number] {
    let timeZoneView: ITimeZoneView[] = [];
    let totalTimeCards: number = 0;
    try {
      const currentTime: DateTime = this.state?.currentTime || DateTime.now().setLocale(wc.Locale).setZone(wc.IANATimeZone);
      let members: IPerson[] = wc.GetTeamMembers(view.members);

      forEach(members, (o) => {
        let tzCurrentTime: DateTime = currentTime.setZone(o.IANATimeZone);
        let timeStyle: string = "";
        if (tzCurrentTime.hour > 6 && tzCurrentTime.hour <= 7) {
          timeStyle = "hoo-wcs-day";
        } else if (tzCurrentTime.hour > 7 && tzCurrentTime.hour <= 19) {
          timeStyle = "hoo-wcs-day";
        }
        else {
          timeStyle = "hoo-wcs-night";
        }
        o.timeStyle = timeStyle;
      });

      const offsetGroups = chain(members).groupBy("offset").map((value, key) => ({ offset: parseInt(key.toString()), members: value })).sortBy("offset").value();
      let styleGroup = "";
      let currentGroup = null;
      totalTimeCards = offsetGroups.length;

      const offsetLimit = ((maxCards + startIndex) > totalTimeCards) ? totalTimeCards : (maxCards + startIndex);
      for (let o = startIndex; o < offsetLimit; o++) {
        let offset = offsetGroups[o];
        const timeStyle = offset.members[0]?.timeStyle;
        if (styleGroup != timeStyle || currentGroup == null) {
          styleGroup = timeStyle;
          timeZoneView.push({ style: timeStyle, offsetGroup: [offset] });
          currentGroup = timeZoneView[timeZoneView.length - 1];
        } else {
          currentGroup.offsetGroup.push(offset);
        }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_sortTimeZones) - ${err}`, LogLevel.Error);
    }
    return [timeZoneView, totalTimeCards];
  }

  private _shiftTimeCards = (cardIndex: number) => {
    try {
      const startTimeCardIndex = this.state.startTimeCardIndex + cardIndex;
      let offsetWidth = 0;
      if (startTimeCardIndex > 0) {
        offsetWidth += 35;
      }
      if ((this.state.maxTimeCards + startTimeCardIndex) < this.state.totalTimeCards) {
        offsetWidth += 35;
      }
      const maxTimeCards = round((this.state.timeCardContainerWidth - offsetWidth) / 250);
      const [timeZoneView, totalTimeCards] = this._sortTimeZones(wc.Config.views[this.state.currentView], startTimeCardIndex, maxTimeCards);
      this.setState({ startTimeCardIndex: startTimeCardIndex, timeZoneView: timeZoneView, totalTimeCards: totalTimeCards, maxTimeCards: maxTimeCards });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_updateTimeCard) - ${err}`, LogLevel.Error);
    }
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
        let [timeZoneView, totalTimeCards] = this._sortTimeZones(view, 0, this.state.maxTimeCards);
        let options: IButtonOption[] = this._getManageViewOptions();
        this.setState({ showManageViews: false, views: config.views, timeZoneView: timeZoneView, totalTimeCards: totalTimeCards, viewOptions: options, currentView: view.viewId, startTimeCardIndex: 0 });
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
          let [timeZoneView, totalTimeCards] = this._sortTimeZones(a, 0, this.state.maxTimeCards);
          this.setState({ showManageViews: false, views: config.views, timeZoneView: timeZoneView, totalTimeCards: totalTimeCards, viewOptions: options, currentView: a.viewId, startTimeCardIndex: 0 });
        } else {
          this.setState({ showManageViews: false, views: config.views, timeZoneView: [], viewOptions: options, currentView: "", startTimeCardIndex: 0 });
        }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_deleteView) - ${err}`, LogLevel.Error);
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
        this._handleRefresh({ showProfile: false });
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_addMember) - ${err}`, LogLevel.Error);
    }
  }

  private _saveMember = async (person: IPerson): Promise<void> => {
    try {
      let success: boolean = false;
      success = await this.props.saveProfile(person);
      if (success) {
        this.setState({ showProfile: false });
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_saveMember) - ${err}`, LogLevel.Error);
    }
  }

  private _removeMember = async (person: IPerson): Promise<void> => {
    try {
      let success: boolean = false;
      success = wc.RemoveTeamMember(person);
      if (success) {
        this._handleRefresh({ showProfile: false });
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_removeMember) - ${err}`, LogLevel.Error);
    }
  }

  private _cancelProfile = () => {
    try {
      this._showProfile(false);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_cancelProfile) - ${err}`, LogLevel.Error);
    }
  }

  private _getManageViewOptions() {
    let options: IButtonOption[] = [];
    try {
      wc.Config.views.map((v) => {
        options.push({ iconType: Icons.TeamView, label: v.viewName, onClick: this._changeView });
      });
      options.push({ iconType: Icons.Edit, label: strings.EditCurrentViewLabel, onClick: this._addNewView });
      options.push({ iconType: Icons.Plus, label: strings.AddNewViewLabel, onClick: this._addNewView });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_getManageViewOptions) - ${err}`, LogLevel.Error);
    }
    return options;
  }

  private _changeView = (viewName: string) => {
    try {
      const views = cloneDeep(this.state.views);
      let v = find(views, { viewName: viewName });
      let [timeZoneView, totalTimeCards] = this._sortTimeZones(v, 0, this.state.maxTimeCards);
      this.setState({ timeZoneView: timeZoneView, totalTimeCards: totalTimeCards, currentView: v.viewId, startTimeCardIndex: 0 });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_changeView) - ${err}`, LogLevel.Error);
    }
  }

  private _addNewView = (viewName: string) => {
    try {
      if (viewName == strings.AddNewViewLabel) {
        this.setState({ currentView: "" });
      }
      this._changeManageViewsVisibility(true);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_addNewView) - ${err}`, LogLevel.Error);
    }
  }

  private _editProfile = (person: IPerson) => {
    this.setState({ profileUser: person, showProfile: true });
  }

  public render(): React.ReactElement<ITeamTimesProps> {
    try {
      const moreCards: boolean = (this.state.maxTimeCards + this.state.startTimeCardIndex) < this.state.totalTimeCards;
      return (
        <div data-component={this.LOG_SOURCE} ref={this._timeCardContainer}>
          <div className="is-flex gap">
            <ButtonSplitPrimary
              className={styles.managebutton}
              label={(this.state.currentView) ? this.state.views[this.state.currentView].viewName : strings.ManageViewsLabel}
              options={this.state.viewOptions} />
            <Button
              className="hoo-button-primary"
              disabled={false}
              label={strings.ManageMembersTitle}
              onClick={() => this._showManageMembers(true)} />
          </div>
          <div className="hoo-wcs">
            {this.state.timeZoneView.map((styleGroup, styleIndex) => {
              return (
                <div className={`${styleGroup.style}`}>
                  {
                    styleGroup.offsetGroup.map((offsetGroup, offsetIndex) => {
                      return (
                        <>
                          {((styleIndex == 0) && (offsetIndex == 0) && (this.state.startTimeCardIndex > 0)) &&
                            <TimeCardArrow
                              iconType={Icons.LeftArrow}
                              altText={"Previous"}
                              direction={Direction.Backward}
                              onClick={this._shiftTimeCards} />
                          }
                          <TimeCard
                            userId={wc.CurrentUser.personId}
                            members={offsetGroup.members}
                            currentTimeZone={offsetGroup.members[0]?.IANATimeZone || wc.IANATimeZone}
                            currentTime={this.state.currentTime}
                            addToMeeting={this.props.addToMeeting}
                            meetingMembers={this.props.meetingMembers}
                            editProfile={this._showProfile} />
                          {(styleIndex == this.state.timeZoneView.length - 1) && (offsetIndex == styleGroup.offsetGroup.length - 1) && (moreCards) &&
                            <TimeCardArrow
                              iconType={Icons.RightArrow}
                              altText={"Next"}
                              direction={Direction.Forward}
                              onClick={this._shiftTimeCards} />
                          }
                        </>
                      );
                    })
                  }
                </div>
              );
            })
            }
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
                delete={this._deleteView}
                viewId={this.state.currentView} />
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