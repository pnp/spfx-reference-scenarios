import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { cloneDeep, filter, find, includes, indexOf, isEqual, remove, sortBy, startsWith } from "lodash";
import styles from "../WorldClock.module.scss";
import DropDown, { IDropDownOption } from "../atoms/DropDown";
import { IPerson, IWCView, WCView } from "../../models/wc.models";
import { wc } from "../../services/wc.service";
import CheckBox from "../atoms/CheckBox";
import TextBox from "../atoms/TextBox";
import Button from "../atoms/Button";
import strings from "WorldClockWebPartStrings";
import SearchBox from "../atoms/SearchBox";
import Avatar, { Size } from "../atoms/Avatar";

export interface IManageViewsProps {
  save: (currentView: IWCView, isDefault: boolean) => void;
  cancel: () => void;
  delete: (currentView: IWCView) => void;
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
  private _viewOptions: IDropDownOption[] = [];

  constructor(props: IManageViewsProps) {
    super(props);
    try {
      //TODO: Do we need this? We are creating the view when we create the config.
      let defaultView: IWCView = new WCView();
      if (wc.Config.views.length == 0) {
        defaultView.viewId = "0";
        defaultView.viewName = strings.NewViewTitle;
      } else {
        defaultView = wc.Config.views[wc.Config.defaultViewId];
      }
      let isDefault = false;
      if (wc.Config.defaultViewId == defaultView.viewId) {
        isDefault = true;
      }
      let currentMembers = sortBy(wc.Config.members, (o) => { return o.displayName; });
      this.state = new ManageViewsState(currentMembers, defaultView.viewName, defaultView, isDefault);
      this._viewOptions = wc.Config.views.map((v) => { return { key: v.viewName, text: v.viewName }; });
      this._viewOptions.unshift({ key: -1, text: strings.NewViewTitle });
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
  private _onDropDownChange = (fieldValue: string, fieldName: string) => {
    try {
      let currentView = new WCView();
      let isDefault: boolean = false;
      currentView.viewName = strings.NewViewTitle;
      if (fieldValue != "-1") {
        currentView = find(wc.Config.views, { viewName: fieldValue });
        if (wc.Config.defaultViewId == currentView.viewId) {
          isDefault = true;
        }
      }
      this.setState({ currentView: currentView, selectedView: currentView.viewName, isDefault: isDefault });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onDropDownChange) - ${err}`, LogLevel.Error);
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
        if (currentView.members.length < 19) {
          this.setState({ errors: false, errorMessage: "" });
        }
      } else {
        if (currentView.members.length < 19) {
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
        <div data-component={this.LOG_SOURCE} className={styles.manageViews}>
          <div className={styles.textLabel}>{strings.SelectAViewHeader}</div>
          <DropDown onChange={this._onDropDownChange} value={this.state.selectedView} options={this._viewOptions} id="views" containsTypeAhead={false} />
          <div className={styles.viewForm}>
            <div className={styles.textLabel}>{strings.ViewTitleHeader}</div>
            <TextBox name="viewName" value={this.state.currentView.viewName} onChange={this._onTextChange} />
            <div className={styles.membersList}>
              <div className={styles.textLabel}>{strings.ViewMembersHeader}</div>
              {this.state.currentView.members.map((m) => {
                let isChecked: boolean = true;
                const member = find(wc.Config.members, { personId: m });
                return (
                  <div className={`${styles.memberContainer}`}>
                    <div className="memberPersona">
                      <CheckBox
                        name={m}
                        label={member.displayName}
                        value={isChecked}
                        onChange={this._onMemberCheckBoxChange}
                        showLabel={false} />
                      <Avatar size={Size.ThirtyTwo} name={member.displayName} src={member.photoUrl} />
                      <span className="center-vertical">{member.displayName}</span>
                    </div>
                  </div>);
              })}
            </div>
            <span className={`${styles.textLabel} hoo-error ${(!this.state.errors) && "is-hidden"}`} id="">{this.state.errorMessage}</span>
            <div className={styles.membersList}>

              <div className={styles.memberSearch}>
                <div className={styles.textLabel}>{strings.AddViewMembersHeader}</div>
                <SearchBox name="Search" value={this.state.searchString} onChange={this._onSearchChange} />
              </div>
              {this.state.searchMembers.map((m) => {
                let isChecked: boolean = false;
                if (this.state.currentView.members.length > 0) {
                  let found = indexOf(this.state.currentView.members, m.personId);
                  if (found > -1) {
                    isChecked = true;
                  }
                }
                return ((!isChecked) &&
                  <div className={`${styles.memberContainer}`}>
                    <div className="memberPersona">
                      <CheckBox
                        name={m.personId}
                        label={m.displayName}
                        value={isChecked}
                        onChange={this._onMemberCheckBoxChange}
                        showLabel={false} />
                      <Avatar size={Size.ThirtyTwo} name={m.displayName} src={m.photoUrl} />
                      <span className="center-vertical">{m.displayName}</span>
                    </div>
                  </div>);
              })}
            </div>
            <div className={styles.textLabel}>{strings.MakeDefaultViewHeader}</div>
            <CheckBox name="defaultView" label={strings.MakeDefaultViewLabel} value={this.state.isDefault} onChange={this._onDefaultViewChange} />
            <div className={styles.buttons} >
              <Button className="hoo-button-primary" disabled={false} label={strings.SaveLabel} onClick={() => this.props.save(this.state.currentView, this.state.isDefault)} />
              <Button className="hoo-button" disabled={false} label={strings.CancelLabel} onClick={() => this.props.cancel()} />
              <Button className="hoo-button" disabled={false} label={strings.DeleteViewLabel} onClick={() => this.props.delete(this.state.currentView)} />
            </div>
          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}