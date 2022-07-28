import * as React from "react";
import { isEqual } from "@microsoft/sp-lodash-subset";
import { IIconType } from "../../../../common/models/designtemplate.models";

export interface IButtonIconProps {
  iconType: IIconType;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export interface IButtonIconState {
}

export class ButtonIconState implements IButtonIconState {
  constructor() { }
}

export default class ButtonIcon extends React.Component<IButtonIconProps, IButtonIconState> {
  private LOG_SOURCE: string = "🔶ButtonIcon";

  constructor(props: IButtonIconProps) {
    super(props);
    this.state = new ButtonIconState();
  }

  public shouldComponentUpdate(nextProps: IButtonIconProps, nextState: IButtonIconState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IButtonIconProps> {
    try {
      return (
        <button className="hoo-buttonicon" aria-label="" onClick={this.props.onClick}>
          <div className="hoo-icon">
            <span className={`hoo-icon-svg ${this.props.iconType.Class}`} aria-hidden="true" dangerouslySetInnerHTML={{ "__html": this.props.iconType.SVG }} />
          </div>
        </button>
      );
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (render) - error rendering component ${err}`
      );
      return null;
    }
  }
}