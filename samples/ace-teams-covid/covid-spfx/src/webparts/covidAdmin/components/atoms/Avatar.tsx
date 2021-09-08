import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEmpty } from "@microsoft/sp-lodash-subset";
import { isEqual } from "@microsoft/sp-lodash-subset";
import { random } from "@microsoft/sp-lodash-subset";

declare module 'react' {
  interface HTMLAttributes<T> extends React.DOMAttributes<T> {
    // extends React's HTMLAttributes for lazy loading
    loading?: string;
  }
}

export enum Size {
  "Sixteen" = 16,
  "TwentyFour" = 24,
  "ThirtyTwo" = 32,
  "Forty" = 40,
  "FortyEight" = 48,
  "SixtyFour" = 64,
}
export interface IAvatarProps {
  size?: Size;
  src: string;
  name?: string;
}

export interface IAvatarState {
}

export class AvatarState implements IAvatarState {
  constructor() { }
}

export default class Avatar extends React.Component<IAvatarProps, IAvatarState> {
  private LOG_SOURCE: string = "🔶Avatar";
  private _styleArray: string[] = ['green10', 'darkGreen20', 'teal10', 'cyan30', 'lightBlue30', 'blue20', 'darkBlue10', 'violet10', 'purple10', 'magenta10', 'lightPink10', 'pink10', 'pinkRed10', 'red10', 'darkRed20', 'orange10', 'orange30', 'orangeYellow20', 'gray30', 'gray20'];
  private _selectedStyle: string = this._styleArray[0];

  constructor(props: IAvatarProps) {
    super(props);
    this.state = new AvatarState();
  }

  public shouldComponentUpdate(nextProps: IAvatarProps, nextState: IAvatarState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }
  private _renderAvatar = (): React.ReactElement => {
    let avatar: React.ReactElement;

    if (isEmpty(this.props.src)) {

      let initials: string = "";
      let nameSplit = this.props.name.split(" ");
      if (nameSplit.length >= 2) {
        initials = nameSplit[0].substring(0, 1) + nameSplit[1].substring(0, 1);
      } else if (nameSplit.length >= 1) {
        initials = nameSplit[0].substring(0, 1);
      }
      avatar = <span>{initials}</span>;
      let rand: number = random(0, this._styleArray.length - 1);
      this._selectedStyle = this._styleArray[rand];
    } else {
      avatar = <img src={this.props.src} loading="lazy" alt="" className="hoo-avatar" />;
    }
    return avatar;
  }

  public render(): React.ReactElement<IAvatarProps> {
    try {
      const avatar = this._renderAvatar();
      return (
        <div className={`hoo-avatar ${(isEmpty(this.props.src)) ? `noImage ${this._selectedStyle}` : ""}`} >
          {avatar}
        </div >
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}