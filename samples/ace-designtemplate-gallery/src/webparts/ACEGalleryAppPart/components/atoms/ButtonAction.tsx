import * as React from "react";
import { IIconType } from "../../../../common/models/designtemplate.models";

export interface IButtonActionProps {
  iconType: IIconType;
  buttonText: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export default class ButtonAction extends React.Component<IButtonActionProps> {
  private LOG_SOURCE = "🔶ButtonAction";

  constructor(props: IButtonActionProps) {
    super(props);
  }

  public render(): React.ReactElement<IButtonActionProps> {
    try {
      return (
        <button className="hoo-buttonaction" onClick={this.props.onClick}>
          <span className="hoo-button-icon" aria-hidden="true">
            <span className="hoo-icon">
              <span className={`hoo-icon-svg ${this.props.iconType.Class}`} aria-hidden="true" dangerouslySetInnerHTML={{ "__html": this.props.iconType.SVG }} />
            </span>
          </span>
          <span className="hoo-button-label"> {this.props.buttonText} </span>

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