import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash-es/isEqual";
import cloneDeep from "lodash-es/cloneDeep";

import { Icons, IIconType } from "../../models/wc.Icons";


export interface IButtonOption {
  iconType: IIconType;
  onClick: (value: string) => void;
  label: string;
}

export interface IButtonSplitPrimaryProps {
  label: string;
  options: IButtonOption[];
  className: string;
}

export interface IButtonSplitPrimaryState {
  open: boolean;
}

export class ButtonSplitPrimaryState implements IButtonSplitPrimaryState {
  constructor(
    public open: boolean = false,
  ) { }
}

export default class ButtonSplitPrimary extends React.Component<IButtonSplitPrimaryProps, IButtonSplitPrimaryState> {
  private LOG_SOURCE: string = "🔶ButtonSplitPrimary";

  constructor(props: IButtonSplitPrimaryProps) {
    super(props);
    this.state = new ButtonSplitPrimaryState();
  }

  public shouldComponentUpdate(nextProps: IButtonSplitPrimaryProps, nextState: IButtonSplitPrimaryState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _open() {
    let open = cloneDeep(this.state.open);
    if (open) {
      open = false;
    } else {
      open = true;
    }
    this.setState({ open: open });
  }

  private _handleChange = (value: string, handler: (value: string) => void) => {
    handler(value);
    this.setState({ open: false });
    this._open();
  }

  public render(): React.ReactElement<IButtonSplitPrimaryProps> {
    try {
      return (

        <div className={`hoo-buttonsplit-primary ${(this.props.className)} ${(this.state.open) ? "show-flyout" : ""}`}>
          <button className="hoo-buttonsplit-standard">
            <div className="hoo-button-label">{this.props.label}</div>
          </button>
          <button className="hoo-buttonsplit-carret" onClick={() => this._open()}>
            <div className="hoo-button-label">
              <div className="hoo-icon">
                <span className={`hoo-icon-svg ${Icons.DownArrow.Class}`} aria-hidden="true" dangerouslySetInnerHTML={{ "__html": Icons.DownArrow.SVG }} >
                </span>
              </div>
            </div>
          </button>
          <ul className="hoo-buttonflyout" role="menu">
            {this.props.options?.map((o) => {
              return (<li className="hoo-buttonflyout-item">
                <button className="hoo-buttonaction" onClick={(e) =>
                  this._handleChange(o.label, o.onClick)}>
                  <span className="hoo-button-icon" aria-hidden="true">
                    <div className="hoo-icon">
                      <span className={`hoo-icon-svg ${o.iconType.Class}`} aria-hidden="true" dangerouslySetInnerHTML={{ "__html": o.iconType.SVG }} >
                      </span>
                    </div>
                  </span>
                  <span className="hoo-button-label">{o.label}</span>
                </button>
              </li>);
            })}
          </ul>
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}