import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { cloneDeep, filter, isEqual, sortBy } from "lodash";
import styles from "../WorldClock.module.scss";
import { IPerson, ITimeZone, Person } from "../../models/wc.models";
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
  searchCurrentMembers: IPerson[];
  searchAllMembers: IPerson[];
  searchString: string;
  searchAllString: string;
  showTimeZoneSelect: boolean;
  showAddMember: boolean;
  currentPerson: IPerson;
}

export class ManageMembersState implements IManageMembersState {
  constructor(
    public searchCurrentMembers: IPerson[] = [],
    public searchAllMembers: IPerson[] = [],
    public searchString: string = "",
    public searchAllString: string = "",
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

      this.state = new ManageMembersState(wc.Config.members);
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
      if (fieldName == "Search") {
        const members = cloneDeep(wc.Config.members);
        let searchCurrentMembers = filter(members, (m) => { return m.displayName.toLowerCase().indexOf(fieldValue.toLowerCase()) > -1; });
        this.setState({ searchCurrentMembers: searchCurrentMembers, searchString: fieldValue });
      } else if (fieldName == "SearchAllMembers") {
        let members = await wc.SearchMember(fieldValue);
        this.setState({ searchAllMembers: members, searchAllString: fieldValue });

      }

    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onTextChange) - ${err}`, LogLevel.Error);
    }
  }

  private _showTimeZoneChange = (visible: boolean, person: IPerson): void => {
    this.setState({ showTimeZoneSelect: visible, currentPerson: person });
  }
  private _showAddMemberChange = (visible: boolean, person: IPerson): void => {
    this.setState({ showAddMember: visible, showTimeZoneSelect: false, currentPerson: person });
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

  private _savePerson() {
    this.props.save(this.state.currentPerson);
    this._showTimeZoneChange(!this.state.showTimeZoneSelect, new Person());
  }

  private _removeMember = async (person: IPerson) => {
    try {
      await this.props.remove(person);
      this.setState({ searchCurrentMembers: wc.Config.members });

    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_removeMember) - ${err}`, LogLevel.Error);
    }
  }

  private _addMember = async (person: IPerson) => {
    try {
      await this.props.add(person);
      this.setState({ searchCurrentMembers: wc.Config.members, searchAllMembers: [], searchAllString: "" });

    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_removeMember) - ${err}`, LogLevel.Error);
    }
  }



  public render(): React.ReactElement<IManageMembersProps> {
    try {

      return (
        <div data-component={this.LOG_SOURCE} className={styles.manageViews}>
          <div className={`${(this.state.showTimeZoneSelect || this.state.showAddMember) ? "is-hidden" : ""}`}>
            <SearchBox name="Search" placeholder="Search" value={this.state.searchString} onChange={this._onSearchChange} />
            <div className={`${styles.membersList} ${styles.twoColumn}`}>
              {sortBy(this.state.searchCurrentMembers, 'firstName').map((m) => {
                return (
                  <div className={`${styles.memberContainer} is-flex`}>
                    <div className="memberPersona">
                      <Avatar size={Size.ThirtyTwo} name={m.displayName} src={m.photoUrl} />
                      <span className="center-vertical">{m.displayName}</span>
                      <ButtonIcon
                        iconType={Icons.Profile}
                        onClick={() => this.props.edit(m)}
                        altText={strings.EditProfileLabel} />
                      <ButtonIcon
                        iconType={Icons.TimeZone}
                        onClick={() => this._showTimeZoneChange(true, m)}
                        altText={strings.EditTimeZoneLabel} />
                      <ButtonIcon
                        iconType={Icons.Trash}
                        onClick={() => this._removeMember(m)}
                        altText="Remove from Team" />
                    </div>
                  </div>);
              })}
            </div>
            <Button className="hoo-button-primary" disabled={false} label="Add Member" onClick={() => this._showAddMemberChange(true, new Person())} />
          </div>

          <div className={`${(!this.state.showTimeZoneSelect) ? "is-hidden" : ""} ${styles.viewForm} hoo-grid`}>
            <div className="col1 center-vertical">
              <Avatar size={Size.ThirtyTwo} name={this.state.currentPerson.displayName} src={this.state.currentPerson.photoUrl} />
              <span className="center-vertical">{this.state.currentPerson.displayName}</span>
            </div>
            <div className="col2 center-vertical">
              <DropDown options={this._availableTimeZones} id="timeZone" value={this.state.currentPerson.IANATimeZone} onChange={this._onDropDownChange} />
            </div>
            <Button className="hoo-button-primary" disabled={false} label={strings.SaveLabel} onClick={() => this._savePerson()} />
            <Button className="hoo-button" disabled={false} label={strings.CancelLabel} onClick={() => this._showTimeZoneChange(!this.state.showTimeZoneSelect, new Person())} />
          </div>
          <div className={`${(!this.state.showAddMember) ? "is-hidden" : ""}`}>
            <SearchBox name="SearchAllMembers" placeholder="Search" value={this.state.searchAllString} onChange={this._onSearchChange} />
            <div className={`${styles.membersList} ${styles.twoColumn}`}>
              {sortBy(this.state.searchAllMembers, 'firstName').map((m) => {
                return (
                  <div className={`${styles.memberContainer} is-flex`}>
                    <div className="memberPersona">
                      <Avatar size={Size.ThirtyTwo} name={m.displayName} src={m.photoUrl} />
                      <span className="center-vertical">{m.displayName}</span>
                      <ButtonIcon
                        iconType={Icons.PlusPerson}
                        onClick={() => this._addMember(m)}
                        altText={strings.EditProfileLabel} />
                    </div>
                  </div>);
              })}
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