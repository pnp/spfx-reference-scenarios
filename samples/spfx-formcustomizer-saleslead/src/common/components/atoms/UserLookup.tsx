import * as React from "react";
import HOOIcon from "@n8d/htwoo-react/HOOIcon";

import UserPill from "./UserPill";
import { sl } from "../../../common/services/slService";
import { IUser } from "../../services/models";

export interface IUserLookupProps {
  users: IUser[] | undefined;
  enabled: boolean;
  addUser: (user: IUser) => void;
  removeUser: (user: IUser) => void;
  multiSelect: boolean;
}

export interface IUserLookupState {
  userSearch: string;
  users: IUser[];
  showSearch: boolean;
}

export class UserLookupState implements IUserLookupState {
  public constructor(
    public userSearch: string = "",
    public users: IUser[] = [],
    public showSearch: boolean = false
  ) { }
}

/**
 * A typeahead people-picker that searches SharePoint users and manages a selected-user list.
 *
 * As the user types, `_onUserSearch` debounces keystrokes (500 ms via `_debounceTypeahead`)
 * before calling `sl.SearchUsers()` to avoid issuing a search request on every keystroke.
 * Results are shown in a dropdown as `UserPill` components. Clicking a result fires
 * `props.addUser`; the delete button on a selected pill fires `props.removeUser`.
 * Supports both single-select and multi-select modes via `props.multiSelect`.
 */
export default class UserLookup extends React.PureComponent<IUserLookupProps, IUserLookupState> {
  private LOG_SOURCE = "🟢UserLookup";

  private _timeOutId!: number;

  constructor(props: IUserLookupProps) {
    super(props);
    this.state = new UserLookupState();
  }

  private _userSearch = async (value?: string): Promise<void> => {
    try {

      if ((value && value.length > 0) || this.state.userSearch.length > 0) {
        const newValue = value || this.state.userSearch;
        const users = await sl.SearchUsers(newValue);
        this.setState({ users });
      } else {
        this.setState({ userSearch: "", users: [], showSearch: false });
      }
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (_userSearch)`, err);
    }
  }

  private _onUserSearch = (event: React.ChangeEvent<HTMLInputElement>, enter: boolean): void => {
    try {
      const searchValue = event.currentTarget.value;
      if (!enter) {
        this.setState({
          userSearch: searchValue,
          showSearch: true
        }, () => {
          if (searchValue.length > 0) {
            this._debounceTypeahead(this._userSearch, 500);
          }
        });
      } else {
        if (searchValue.length > 0) {
          void this._userSearch(searchValue);
        }
      }
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (_onUserSearch)`, err);
    }
  }

  private _debounceTypeahead = (fn: () => void, delay: number): void => {
    try {
      if (this._timeOutId) {
        clearTimeout(this._timeOutId);
      }
      this._timeOutId = setTimeout(() => {
        fn();
      }, delay);
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (_debounceTypeahead)`, err);
    }
  }

  private _addUser = (user: IUser): void => {
    try {
      this.setState({ userSearch: "", users: [], showSearch: false }, () => {
        this.props.addUser(user);
      })
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (_addUser)`, err);
    }
  }

  public render(): React.ReactElement<IUserLookupProps> | undefined {
    try {
      const disabled: boolean = !this.props.enabled;
      return (
        <div data-component={this.LOG_SOURCE} className={`hoo-select hoo-tagselect${(disabled)?" is-readonly":""}`}>
          <div id='custom-select-status' className='hidden-visually' aria-live="polite">
            {this.props.users && this.props.users.length > 0 && this.props.users.map((user, index) => {
              return (
                <div key={index}>{user.Title}</div>
              );
            })}
          </div>
          <div id="hoo-select-input" className="hoo-select-text" aria-autocomplete="both" aria-controls="custom-select-list">
            {this.props.users && this.props.users.length > 0 && this.props.users.map((user, index) => {
              return (
                <UserPill key={index} index={index} title={user.Title} userId={user.Id} showDelete={true} pillClick={() => this.props.removeUser(user)} />
              );
            })}
            <input type="text" className="hoo-tagselect-input" disabled={disabled} value={this.state.userSearch} onChange={(event) => this._onUserSearch(event, false)} />
          </div>
          {this.state.showSearch &&
            <ul className="hoo-select-dropdown">
              {this.state.users && this.state.users.length > 0 && this.state.users.map((user, index) => {
                return (
                  <li key={index} data-value={index} className="hoo-option">
                    <UserPill index={index} title={user.Title} userId={user.Id} showDelete={false} pillClick={() => this._addUser(user)} />
                  </li>
                );
              })}
              {(!this.state.users || this.state.users.length < 1) &&
                <li data-value="0" className="hoo-option disabled">
                  <div className="hoo-option-loading">
                    <HOOIcon iconName="icon-arrow-sync" />
                    <span className="hoo-loading-label">Loading</span>
                  </div>
                </li>
              }
            </ul>
          }
        </div>
      );
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (render)`, err);
      return;
    }
  }
}