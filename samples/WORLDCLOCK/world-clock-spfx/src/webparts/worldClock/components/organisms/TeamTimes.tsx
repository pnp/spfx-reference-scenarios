import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { chain, cloneDeep, Dictionary, find, groupBy, isEqual, merge, sortBy } from "lodash";
import Dialog from "../molecules/Dialog";
import strings from "WorldClockWebPartStrings";
import ManageViews from "./ManageViews";
import { IPerson, IView, Person, View } from "../../models/wc.models";
import { wc } from "../../services/wc.service";
import TimeCard from "../molecules/TimeCard";
import { DateTime } from "luxon";

export interface ITeamTimesProps {
  userId: number;
  currentTime: DateTime;
}

export interface ITeamTimesState {
  needsConfig: boolean;
  manageViewsVisible: boolean;
  views: IView[];
  timeZoneView: any[];
}

export class TeamTimesState implements ITeamTimesState {
  constructor(
    public needsConfig: boolean = false,
    public manageViewsVisible: boolean = false,
    public views: IView[] = [],
    public timeZoneView: any[] = [],
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
        timeZoneView = chain(wc.Config.views[wc.Config.defaultViewId].members).groupBy("offset").map((value, key) => ({ offset: key, members: value })).value();
        //timeZoneView = groupBy("offset", [(value, key) => { offset: key, members: value }]).value();
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

  public render(): React.ReactElement<ITeamTimesProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE}>
          <div className="hoo-wcs">
            {this.state.timeZoneView.map((m) => {
              let members: IPerson[] = m.members as IPerson[];
              return (<TimeCard members={members} currentTimeZone={wc.IANATimeZone} currentTime={this.props.currentTime} />);
            })}
          </div>
          <Dialog header={(this.state.needsConfig) ? strings.ConfigureViewsTitle : strings.ManageViewsTitle} content={(this.state.needsConfig) ? strings.ConfigureViewsContent : strings.ManageViewsContent} visible={this.state.manageViewsVisible} onChange={this._changeManageViewsVisibility} height={70} width={60}>
            <ManageViews userId={this.props.userId} views={this.state.views} save={this._saveView} cancel={this._cancelView} />
          </Dialog>
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}