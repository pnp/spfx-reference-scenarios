import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import filter from "lodash/filter";
import cloneDeep from "lodash/cloneDeep";
import sortBy from "lodash/sortBy";

import { CONFIG_TYPE, IPerson, Person } from "../../models/wc.models";
import strings from "WorldClockWebPartStrings";
import SearchBox from "../atoms/SearchBox";
import ButtonIcon from "../atoms/ButtonIcon";
import { Icons } from "../../models/wc.Icons";
import { wc } from "../../services/wc.service";
import DropDown, { IDropDownOption } from "../atoms/DropDown";
import Button from "../atoms/Button";
import Avatar from "../atoms/Avatar";

export interface IManageMembersProps {
  save: (person: IPerson) => void;
  remove: (person: IPerson) => void;
  add: (person: IPerson) => void;
  edit: (person: IPerson) => void;
}

export interface IManageMembersState {
  searchMembers: IPerson[];
  searchString: string;
  showTimeZoneSelect: boolean;
  showAddMember: boolean;
  currentPerson: IPerson;
}

export class ManageMembersState implements IManageMembersState {
  constructor(
    public searchMembers: IPerson[] = [],
    public searchString: string = "",
    public showTimeZoneSelect: boolean = false,
    public showAddMember: boolean = false,
    public currentPerson: IPerson = new Person(),
  ) { }
}

export default class ManageMembers extends React.Component<IManageMembersProps, IManageMembersState> {
  private LOG_SOURCE: string = "🔶 ManageMembers";
  private _availableTimeZones: IDropDownOption[] = [];
  private _timeOutId: any;

  constructor(props: IManageMembersProps) {
    super(props);
    try {
      this._availableTimeZones = wc.AvailableTimeZones.map((tz) => { return { key: tz.alias, text: tz.displayName }; });
      this._availableTimeZones.unshift({ key: "", text: "" });
      let currentMembers = sortBy(wc.Config.members, (o) => { return o.displayName; });

      this.state = new ManageMembersState(currentMembers);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (constructor) - ${err}`, LogLevel.Error);
    }
  }

  public shouldComponentUpdate(nextProps: Readonly<IManageMembersProps>, nextState: Readonly<IManageMembersState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private debounceTypeahead = (fn: () => {}, delay: number) => {
    try {
      if (this._timeOutId) {
        clearTimeout(this._timeOutId);
      }
      this._timeOutId = setTimeout(() => {
        fn();
      }, delay);
    } catch (err) {
      console.error(`${err} - ${this.LOG_SOURCE} (debounceTypeahead)`);
    }
  }

  private _onSearchChange = async (fieldValue: string, fieldName: string) => {
    try {
      this.setState({
        searchString: fieldValue
      }, () => {
        if (fieldValue.length > 0)
          this.debounceTypeahead(this.doTypeahead, 500);
      });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onSearchChange) - ${err}`, LogLevel.Error);
    }
  }

  private doTypeahead = async () => {
    try {
      let members: IPerson[] = [];
      if (!this.state.showAddMember) {
        members = sortBy(filter(wc.Config.members, (m) => { return m.displayName.toLowerCase().indexOf(this.state.searchString.toLowerCase()) > -1; }), (o) => { return o.displayName; });
      } else {
        members = await wc.SearchMember(this.state.searchString);
        members = sortBy(members, (o) => { return o.displayName; });
      }
      this.setState({ searchMembers: members });
    } catch (err) {
      console.error(`${err} - ${this.LOG_SOURCE} (doTypeahead)`);
    }
  }

  private _showTimeZoneChange = (visible: boolean, person: IPerson): void => {
    this.setState({ showTimeZoneSelect: visible, currentPerson: person });
  }
  private _showAddMemberChange = (visible: boolean, person: IPerson): void => {
    try {
      let members: IPerson[] = [];
      if (!visible) {
        members = sortBy(wc.Config.members, (o) => { return o.displayName; });
      }
      this.setState({ showAddMember: visible, showTimeZoneSelect: false, currentPerson: person, searchMembers: members, searchString: "" });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_showTimeZoneChange) - ${err}`, LogLevel.Error);
    }

  }

  private _onDropDownChange = (fieldValue: string, fieldName: string) => {
    try {
      let currentPerson: IPerson = cloneDeep(this.state.currentPerson);
      currentPerson.IANATimeZone = fieldValue;

      this.setState({ currentPerson: currentPerson });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onDropDownChange) - ${err}`, LogLevel.Error);
    }
  }

  private async _savePerson() {
    try {
      await this.props.save(this.state.currentPerson);
      this._showTimeZoneChange(!this.state.showTimeZoneSelect, new Person());
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_savePerson) - ${err}`, LogLevel.Error);
    }

  }

  private _removeMember = async (person: IPerson) => {
    try {
      await this.props.remove(person);
      let members = sortBy(wc.Config.members, (o) => { return o.displayName; });
      this.setState({ searchMembers: members });

    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_removeMember) - ${err}`, LogLevel.Error);
    }
  }

  private _addMember = async (person: IPerson) => {
    try {
      await this.props.add(person);
      let members = sortBy(wc.Config.members, (o) => { return o.displayName; });
      this.setState({ searchMembers: members, searchString: "", showAddMember: false });

    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_addMember) - ${err}`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<IManageMembersProps> {
    try {

      return (
        <div data-component={this.LOG_SOURCE} className="manageViews">
          <div className={`${(this.state.showTimeZoneSelect) ? "is-hidden" : ""}`}>
            <div className="hoo-grid">
              <div className="two-thirds center-vertical">
                {(!this.state.showAddMember) ?
                  <SearchBox
                    name="Search"
                    placeholder={(wc.ConfigType === CONFIG_TYPE.Personal) ? strings.PAManageMembersFilterPlaceholder : strings.ManageMembersFilterPlaceholder}
                    value={this.state.searchString}
                    onChange={this._onSearchChange} /> :
                  <SearchBox
                    name="SearchAllMembers"
                    placeholder={strings.PAManageMembersSearchPlaceholder}
                    value={this.state.searchString}
                    onChange={this._onSearchChange} />
                }
              </div>
              {(wc.ConfigType == CONFIG_TYPE.Personal) &&
                <div className="one-third">
                  {(!this.state.showAddMember) ?
                    <Button
                      className="hoo-button"
                      disabled={false}
                      label={strings.AddMemberLabel}
                      onClick={() => this._showAddMemberChange(true, new Person())} /> :
                    <Button
                      className="hoo-button"
                      disabled={false}
                      label={strings.CancelLabel}
                      onClick={() => this._showAddMemberChange(false, new Person())} />
                  }
                </div>
              }

            </div>
            <div className={`membersList members`}>
              {(this.state.searchMembers.length == 0 && this.state.searchString.length > 0) &&
                <span className={`hoo-fontsize-18 hoo-error`} id="">{strings.NoResultsLabel}</span>
              }
              {this.state.searchMembers.map((m) => {
                return (

                  <div className={`memberContainer`}>
                    <div className="hoo-persona-40">
                      <div className="hoo-avatar-pres">
                        <Avatar src={m.photoUrl} name={m.displayName} />
                      </div>
                      <div className="hoo-persona-data">
                        <div className="hoo-persona-name" title={m.displayName}>{m.displayName} </div>
                        <div className="hoo-persona-function"><span>{((wc.ConfigType === CONFIG_TYPE.Personal) && (!this.state.showAddMember)) &&
                          <ButtonIcon
                            iconType={Icons.Profile}
                            onClick={() => this.props.edit(m)}
                            altText={strings.EditProfileLabel} />
                        }
                          {(this.state.showAddMember) ?
                            <ButtonIcon
                              iconType={Icons.PlusPerson}
                              onClick={() => this._addMember(m)}
                              altText={strings.AddMemberLabel} /> :
                            <ButtonIcon
                              iconType={Icons.TimeZone}
                              onClick={() => this._showTimeZoneChange(true, m)}
                              altText={strings.EditTimeZoneLabel} />
                          }

                          {((wc.ConfigType === CONFIG_TYPE.Personal) && (!this.state.showAddMember)) &&
                            <ButtonIcon
                              iconType={Icons.Trash}
                              onClick={() => this._removeMember(m)}
                              altText={strings.RemoveFromTeamLabel} />
                          }</span></div>
                      </div>
                    </div>
                  </div>

                );
              })}
            </div>
          </div>
          {this.state.showTimeZoneSelect &&
            <div className={`${(!this.state.showTimeZoneSelect) ? "is-hidden" : ""} viewForm hoo-grid`}>
              <div className="one-third center-vertical is-flex">
                <div className="hoo-persona-40">
                  <div className="hoo-avatar-pres">
                    <Avatar src={this.state.currentPerson.photoUrl} name={this.state.currentPerson.displayName} />
                  </div>
                  <div className="hoo-persona-data">
                    <div className="hoo-persona-name">{this.state.currentPerson.displayName}</div>
                  </div>
                </div>
              </div>
              <div className="two-thirds center-vertical">
                <DropDown
                  containsTypeAhead={true}
                  options={this._availableTimeZones}
                  id="timeZone"
                  value={this.state.currentPerson.IANATimeZone}
                  onChange={this._onDropDownChange} />
              </div>
              <div className="one-third">
                <Button
                  className="hoo-button-primary"
                  disabled={false}
                  label={strings.SaveLabel}
                  onClick={() => this._savePerson()} />
                <Button
                  className="hoo-button"
                  disabled={false}
                  label={strings.CancelLabel}
                  onClick={() => this._showTimeZoneChange(!this.state.showTimeZoneSelect, new Person())} />
              </div>
            </div>
          }

        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}