import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";
import ButtonIcon from "../atoms/ButtonIcon";
import { Icons } from "../../models/enums";

export interface IDialogProps {
  header: string;
  content: string;
  visible: boolean;
  onChange: (visibility: boolean) => void;
  height?: number;
  width?: number;
}

export interface IDialogState {
}

export class DialogState implements IDialogState {
  constructor(
  ) { }
}

export default class Dialog extends React.Component<IDialogProps, IDialogState> {
  private LOG_SOURCE: string = "🔶Dialog";

  constructor(props: IDialogProps) {
    super(props);
    this.state = new DialogState();
  }

  public shouldComponentUpdate(nextProps: IDialogProps, nextState: IDialogState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IDialogProps> {
    try {
      const height: number = this.props.height || 30;
      const width: number = this.props.width || 40;
      const styleBlock = { "--lqdDialogHeight": "30vh", "--lqdDialogWidth": "40vw" } as React.CSSProperties;
      return (
        <div className="tmp-hidden">
          <div className={`hoo-mdldialog-outer  ${(this.props.visible) ? "is-visible" : ""}`}>
            <div className="hoo-mdldialog" style={styleBlock}>
              <div className="hoo-dlgheader">
                <div className="hoo-dlgheader-title">
                  <h2>{this.props.header}</h2>
                </div>
                <div className="hoo-dlgheader-closer">
                  <ButtonIcon iconType={Icons.Close} onClick={() => { this.props.onChange(false); }} />
                </div>
              </div>
              <div className="hoo-dlgcontent">
                {this.props.content}
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