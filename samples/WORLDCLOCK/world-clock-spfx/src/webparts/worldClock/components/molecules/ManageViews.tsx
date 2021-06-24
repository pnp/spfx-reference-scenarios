import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import filter from "lodash/filter";
import cloneDeep from "lodash/cloneDeep";
import sortBy from "lodash/sortBy";
import find from "lodash/find";
import indexOf from "lodash/indexOf";
import isEmpty from "lodash/isEmpty";

import { IPerson, IWCView, WCView } from "../../models/wc.models";
import { wc } from "../../services/wc.service";
import CheckBox from "../atoms/CheckBox";
import TextBox from "../atoms/TextBox";
import Button from "../atoms/Button";
import strings from "WorldClockWebPartStrings";
import SearchBox from "../atoms/SearchBox";
import Avatar from "../atoms/Avatar";

export interface IManageViewsProps {
  save: (currentView: IWCView, isDefault: boolean) => void;
  cancel: () => void;
  delete: (currentView: IWCView) => void;
  viewId?: string;
}

export interface IManageViewsState {
  searchMembers: IPerson[];
  selectedView: string;
  currentView: IWCView;
  isDefault: boolean;
  searchString: string;
  errors: boolean;
  errorMessage: string;
}

export class ManageViewsState implements IManageViewsState {
  constructor(
    public searchMembers: IPerson[] = [],
    public selectedView: string = "",
    public currentView: IWCView = new WCView(),
    public isDefault: boolean = false,
    public searchString: string = "",
    public errors: boolean = false,
    public errorMessage: string = ""
  ) { }
}

export default class ManageViews extends React.Component<IManageViewsProps, IManageViewsState> {
  private LOG_SOURCE: string = "🔶 ManageViews";
  private _maxMembers: number = 100;

  constructor(props: IManageViewsProps) {
    super(props);
    try {
      let defaultView: IWCView = new WCView();
      if (wc.Config.views.length == 0) {
        defaultView.viewId = "0";
        defaultView.viewName = strings.DefaultViewTitle;
      } else {
        if (!isEmpty(this.props.viewId)) {
          defaultView = find(wc.Config.views, { viewId: this.props.viewId });
        }

      }
      let isDefault = false;
      if (wc.Config.defaultViewId == defaultView.viewId) {
        isDefault = true;
      }
      let currentMembers = sortBy(wc.Config.members, (o) => { return o.displayName; });
      this.state = new ManageViewsState(currentMembers, defaultView.viewName, defaultView, isDefault);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (constructor) - ${err}`, LogLevel.Error);
    }
  }

  public shouldComponentUpdate(nextProps: Readonly<IManageViewsProps>, nextState: Readonly<IManageViewsState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _onTextChange = (fieldValue: string, fieldName: string) => {
    try {
      const currentView = cloneDeep(this.state.currentView);
      currentView[fieldName] = fieldValue;
      this.setState({ currentView: currentView });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onTextChange) - ${err}`, LogLevel.Error);
    }
  }
  private _onSearchChange = (fieldValue: string, fieldName: string) => {
    try {
      const members = cloneDeep(wc.Config.members);
      let searchMembers = sortBy(filter(members, (m) => { return m.displayName.toLowerCase().indexOf(fieldValue.toLowerCase()) > -1; }), (o) => { return o.displayName; });
      this.setState({ searchMembers: searchMembers, searchString: fieldValue });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onTextChange) - ${err}`, LogLevel.Error);
    }
  }

  private _onMemberCheckBoxChange = (fieldValue: any, fieldName: string) => {
    try {
      const currentView = cloneDeep(this.state.currentView);
      let memberIdx = currentView.members.indexOf(fieldName);

      if (memberIdx > -1) {
        if (!fieldValue.checked) {
          currentView.members.splice(memberIdx, 1);
        }
        if (currentView.members.length < this._maxMembers) {
          this.setState({ errors: false, errorMessage: "" });
        }
      } else {
        if (currentView.members.length < this._maxMembers) {
          let newMember = find(wc.Config.members, { personId: fieldName });
          currentView.members.push(newMember.personId);
        } else {
          this.setState({ errors: true, errorMessage: strings.MaxMembersError });
        }
      }
      this.setState({ currentView: currentView });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onMemberCheckBoxChange) - ${err}`, LogLevel.Error);
    }
  }
  private _onDefaultViewChange = (fieldValue: any, fieldName: string) => {
    try {
      let isDefault = cloneDeep(this.state.isDefault);
      if (fieldValue.checked) {
        isDefault = true;
      } else {
        isDefault = false;
      }

      this.setState({ isDefault: isDefault });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onDefaultViewChange) - ${err}`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<IManageViewsProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className={`manageViews hoo-grid`}>
          <div className="full-width">
            <div className="hoo-fontsize-18">{strings.ViewTitleHeader}</div>
            <TextBox name="viewName" value={this.state.currentView.viewName} onChange={this._onTextChange} />
          </div>
          <span className={`hoo-fontsize-18 full-width hoo-error ${(!this.state.errors) && "is-hidden"}`} id="">{this.state.errorMessage}</span>
          <div className="full-width center-vertical">
            <div className={`hoo-fontsize-18 center-vertical`}>{strings.AddViewMembersHeader}</div>
            <SearchBox name="Search" placeholder={strings.ManageMembersFilterPlaceholder} value={this.state.searchString} onChange={this._onSearchChange} />
          </div>
          <div className={`membersList full-width`}>
            {this.state.searchMembers.map((m) => {
              let isChecked: boolean = false;
              if (this.state.currentView.members.length > 0) {
                let found = indexOf(this.state.currentView.members, m.personId);
                if (found > -1) {
                  isChecked = true;
                }
              }
              return (
                <div className={`memberContainer`}>
                  <div className="hoo-persona-40">
                    <CheckBox
                      name={m.personId}
                      label={m.displayName}
                      value={isChecked}
                      onChange={this._onMemberCheckBoxChange}
                      showLabel={false} />
                    <div className="hoo-avatar-pres">
                      <Avatar src={m.photoUrl} name={m.displayName} />
                    </div>
                    <div className="hoo-persona-data">
                      <div className="hoo-persona-name" title={m.displayName}>{m.displayName} </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="full-width">
            <div className="hoo-fontsize-18">{strings.MakeDefaultViewHeader}</div>
            <CheckBox
              name="defaultView"
              label={strings.MakeDefaultViewLabel}
              value={this.state.isDefault}
              onChange={this._onDefaultViewChange} />
          </div>

          <div className="is-flex gap full-width" >
            <Button
              className="hoo-button-primary"
              disabled={false}
              label={strings.SaveLabel}
              onClick={() => this.props.save(this.state.currentView, this.state.isDefault)} />
            <Button
              className="hoo-button"
              disabled={false}
              label={strings.CancelLabel}
              onClick={() => this.props.cancel()} />
            <Button
              className="hoo-button"
              disabled={false}
              label={strings.DeleteViewLabel}
              onClick={() => this.props.delete(this.state.currentView)} />
          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}