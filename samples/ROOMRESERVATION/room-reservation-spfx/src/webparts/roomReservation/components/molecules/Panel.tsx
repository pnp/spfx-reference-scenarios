import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash-es/isEqual";
import ButtonIcon from "../atoms/ButtonIcon";
import { Icons } from "../../models/rr.Icons";

export interface IPanelProps {
  header: string;
  content: string;
  visible: boolean;
  onChange: () => void;
  width?: number;
}

export interface IPanelState {
}

export class PanelState implements IPanelState {
  constructor() { }
}

export default class Panel extends React.Component<IPanelProps, IPanelState> {
  private LOG_SOURCE: string = "🔶 Panel";

  constructor(props: IPanelProps) {
    super(props);
    this.state = new PanelState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IPanelProps>, nextState: Readonly<IPanelState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IPanelProps> {
    try {
      const width: number = this.props.width || 40;
      const styleBlock = { "--lqdDialogWidth": `${width}vw` } as React.CSSProperties;
      return (

        <div className="tmp-hidden" data-component={this.LOG_SOURCE}>
          <div className={`hoo-mdldialog-outer is-sidebar-right ${(this.props.visible) ? "is-visible" : ""}`}>
            <div className="hoo-mdldialog" style={styleBlock}>
              <div className="hoo-dlgheader">
                <div className="hoo-dlgheader-title">
                  <h2>{this.props.header}</h2>
                </div>
                <div className="hoo-dlgheader-closer">
                  <ButtonIcon iconType={Icons.Close} onClick={() => { this.props.onChange(); }} />
                </div>
              </div>
              <div className="hoo-dlgcontent">
                <p>{this.props.content}</p>
                {this.props.children || null}
              </div>
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