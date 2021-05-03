import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { cloneDeep, find, isEqual, remove } from "lodash";
import styles from "../WorldClock.module.scss";
import DropDown, { IDropDownOption } from "../atoms/DropDown";
import { IView, View } from "../../models/wc.models";
import { wc } from "../../services/wc.service";
import CheckBox from "../atoms/CheckBox";
import TextBox from "../atoms/TextBox";
import Button from "../atoms/Button";
import strings from "WorldClockWebPartStrings";

export interface IManageViewsProps {
  save: (currentView: IView, isDefault: boolean) => void;
  cancel: () => void;
}

export interface IManageViewsState {
  currentView: IView;
  isDefault: boolean;
}

export class ManageViewsState implements IManageViewsState {
  constructor(
    public currentView: IView = new View(),
    public isDefault: boolean = false,
  ) { }
}

export default class ManageViews extends React.Component<IManageViewsProps, IManageViewsState> {
  private LOG_SOURCE: string = "🔶 ManageViews";
  private _viewOptions: IDropDownOption[] = [];

  constructor(props: IManageViewsProps) {
    super(props);
    try {

      let defaultView: IView = new View();
      if (wc.Config.views.length == 0) {
        defaultView.viewId = "0";
        defaultView.viewName = "New View";
      } else {
        defaultView = wc.Config.views[wc.Config.defaultViewId];
      }
      let isDefault = false;
      if (wc.Config.defaultViewId == defaultView.viewId) {
        isDefault = true;
      }
      this.state = new ManageViewsState(defaultView, isDefault);
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
  private _onDropDownChange = (fieldValue: string, fieldName: string) => {
    try {
      let currentView = new View();
      let isDefault: boolean = false;
      currentView.viewName = "New";
      if (fieldValue != "-1") {
        currentView = find(wc.Config.views, { viewName: fieldValue });
        if (wc.Config.defaultViewId == currentView.viewId) {
          isDefault = true;
        }
      }
      this.setState({ currentView: currentView, isDefault: isDefault });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onDropDownChange) - ${err}`, LogLevel.Error);
    }
  }
  private _onMemberCheckBoxChange = (fieldValue: any, fieldName: string) => {
    try {
      const currentView = cloneDeep(this.state.currentView);
      let member = find(currentView.members, { personId: fieldName });
      if (member) {
        if (!fieldValue.checked) {
          remove(currentView.members, member);
        }
      } else {
        let newMember = find(wc.Config.members, { personId: fieldName });
        currentView.members.push(newMember);
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
      this._viewOptions = wc.Config.views.map((v) => { return { key: v.viewName, text: v.viewName }; });
      this._viewOptions.unshift({ key: -1, text: "New View" });
      return (
        <div data-component={this.LOG_SOURCE} className={styles.manageViews}>
          <div className={styles.textLabel}>{strings.SelectAViewHeader}</div>
          <DropDown onChange={this._onDropDownChange} value={this.state.currentView.viewName} options={this._viewOptions} id="views" />

          <div className={styles.viewForm}>
            <div className={styles.textLabel}>{strings.ViewTitleHeader}</div>
            <TextBox name="viewName" value={this.state.currentView.viewName} onChange={this._onTextChange} />
            <div className={styles.membersList}>
              <div className={styles.textLabel}>{strings.ViewMembersHeader}</div>
              {wc.Config.members.map((m) => {
                let isChecked: boolean = false;
                if (this.state.currentView.members.length > 0) {
                  let member = find(this.state.currentView.members, { personId: m.personId });
                  if (member) {
                    isChecked = true;
                  }
                }
                return (<CheckBox name={m.personId} label={m.displayName} value={isChecked} onChange={this._onMemberCheckBoxChange} />);
              })}
            </div>
            <div className={styles.textLabel}>{strings.MakeDefaultViewHeader}</div>
            <CheckBox name="defaultView" label={strings.MakeDefaultViewLabel} value={this.state.isDefault} onChange={this._onDefaultViewChange} />
            <div className={styles.buttons} >
              <Button className="hoo-button-primary" disabled={false} label={strings.SaveLabel} onClick={() => this.props.save(this.state.currentView, this.state.isDefault)} />
              <Button className="hoo-button" disabled={false} label={strings.CancelLabel} onClick={() => this.props.cancel()} />
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