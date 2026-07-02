import HOOAvatarPres, { HOOAvatarSize, HOOPresenceStatus } from "@n8d/htwoo-react/HOOAvatarPres";
import HOOButton, { HOOButtonType } from "@n8d/htwoo-react/HOOButton";
import * as React from "react";

export interface IUserPillProps {
  index: number;
  title: string;
  userId: string | undefined;
  showDelete: boolean;
  pillClick?: () => void;
}

export interface IUserPillState {
}

/**
 * Renders a user in one of two visual forms depending on `props.showDelete`:
 * - `showDelete=true` (selected user): avatar + name + remove (×) button — used for users
 *   already added to the field.
 * - `showDelete=false` (search result): expanded persona card with avatar and name,
 *   clickable to add the user to the field.
 *
 * Avatar images are loaded from the SharePoint user photo endpoint
 * (`/_layouts/15/userphoto.aspx`) using `props.userId` as the account identifier.
 */
export default class UserPill extends React.PureComponent<IUserPillProps, IUserPillState> {
  private LOG_SOURCE = "🟢UserPill";

  public constructor(props: IUserPillProps) {
    super(props);
    this.state = {};
  }

  public render(): React.ReactElement<IUserPillProps> | undefined {
    try {
      return (
        <>
          {this.props.showDelete &&
            <div key={this.props.index} data-component={this.LOG_SOURCE} className="hoo-pill is-persona">
              <div className="hoo-pill-img">
                <HOOAvatarPres size={HOOAvatarSize.Px24} imageSource={`/_layouts/15/userphoto.aspx?size=S&username=${this.props.userId}`} imageAlt={this.props.userId || ""} status={HOOPresenceStatus.Invisible} />
              </div>
              <div className="hoo-pill-lbl">{this.props.title}</div>
              <div className="hoo-pill-delete">
                <HOOButton type={HOOButtonType.Icon} iconName="hoo-icon-close" onClick={this.props.pillClick} />
              </div>
            </div>
          }
          {!this.props.showDelete &&
            <div key={this.props.index} data-component={this.LOG_SOURCE} className="hoo-persona-24" onClick={this.props.pillClick}>
              <HOOAvatarPres size={HOOAvatarSize.Px24} imageSource={`/_layouts/15/userphoto.aspx?size=S&username=${this.props.userId}`} imageAlt={this.props.userId || ""} status={HOOPresenceStatus.Invisible} />
              <div className="hoo-persona-data">
                <div className="hoo-persona-name">{this.props.title}</div>
                <div className="hoo-persona-function"><span>{"UNKNOWN"}</span></div>
                <div className="hoo-persona-statustext"><span>{"Invisible"}</span></div>
                <div className="hoo-persona-available"><span>{HOOPresenceStatus.Invisible}</span></div>
              </div>
            </div>
          }
        </>
      );
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (render) - ${err}`);
      return;
    }
  }
}