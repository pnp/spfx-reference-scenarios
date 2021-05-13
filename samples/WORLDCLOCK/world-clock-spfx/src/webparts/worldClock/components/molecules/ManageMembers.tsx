import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { cloneDeep, filter, isEqual, sortBy } from "lodash";
import styles from "../WorldClock.module.scss";
import { CONFIG_TYPE, IPerson, Person } from "../../models/wc.models";
import strings from "WorldClockWebPartStrings";
import SearchBox from "../atoms/SearchBox";
import ButtonIcon from "../atoms/ButtonIcon";
import { Icons } from "../../models/wc.Icons";
import { wc } from "../../services/wc.service";
import DropDown, { IDropDownOption } from "../atoms/DropDown";
import Button from "../atoms/Button";
import Avatar, { Size } from "../atoms/Avatar";

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

  private _onSearchChange = async (fieldValue: string, fieldName: string) => {
    try {
      let members: IPerson[] = [];
      if (fieldName == "Search") {
        members = sortBy(filter(wc.Config.members, (m) => { return m.displayName.toLowerCase().indexOf(fieldValue.toLowerCase()) > -1; }), (o) => { return o.displayName; });
      } else if (fieldName == "SearchAllMembers") {
        members = await wc.SearchMember(fieldValue);
        members = sortBy(members, (o) => { return o.displayName; });
      }
      this.setState({ searchMembers: members, searchString: fieldValue });

    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onTextChange) - ${err}`, LogLevel.Error);
    }
  }

  private _showTimeZoneChange = (visible: boolean, person: IPerson): void => {
    this.setState({ showTimeZoneSelect: visible, currentPerson: person });
  }
  private _showAddMemberChange = (visible: boolean, person: IPerson): void => {
    let members: IPerson[] = [];
    if (!visible) {
      members = sortBy(wc.Config.members, (o) => { return o.displayName; });
    }
    this.setState({ showAddMember: visible, showTimeZoneSelect: false, currentPerson: person, searchMembers: members, searchString: "" });
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
    await this.props.save(this.state.currentPerson);
    this._showTimeZoneChange(!this.state.showTimeZoneSelect, new Person());
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
        <div data-component={this.LOG_SOURCE} className={styles.manageViews}>
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
            <div className={`${styles.membersList}`}>
              {(this.state.searchMembers.length == 0) &&
                <span className={`hoo-fontsize-18 hoo-error`} id="">{strings.NoResultsLabel}</span>
              }
              {this.state.searchMembers.map((m) => {
                return (
                  <div className={`${styles.memberContainer} is-flex`}>
                    <div className="memberPersona">
                      <Avatar size={Size.ThirtyTwo} name={m.displayName} src={m.photoUrl} />
                      <div>
                        <span>{m.displayName}</span>

                        {(wc.ConfigType === CONFIG_TYPE.Personal) &&
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

                        {(wc.ConfigType === CONFIG_TYPE.Personal) &&
                          <ButtonIcon
                            iconType={Icons.Trash}
                            onClick={() => this._removeMember(m)}
                            altText={strings.RemoveFromTeamLabel} />
                        }

                      </div>
                    </div>
                  </div>);
              })}
            </div>
          </div>
          {this.state.showTimeZoneSelect &&
            <div className={`${(!this.state.showTimeZoneSelect) ? "is-hidden" : ""} ${styles.viewForm} hoo-grid`}>
              <div className="one-third center-vertical is-flex">
                <Avatar
                  size={Size.ThirtyTwo}
                  name={this.state.currentPerson.displayName}
                  src={this.state.currentPerson.photoUrl} />
                <span className="check-box-center">{this.state.currentPerson.displayName}</span>
              </div>
              <div className="two-thirds">
                <DropDown
                  containsTypeAhead={true}
                  options={this._availableTimeZones}
                  id="timeZone"
                  value={this.state.currentPerson.IANATimeZone}
                  onChange={this._onDropDownChange} />
              </div>
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
          }

        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}