import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "lodash";
import ButtonIcon from "../atoms/ButtonIcon";
import { Icons } from "../../enums";

export interface IDialogProps {
  header: string;
  content: string;
  visible: boolean;
  onChange: (visibility: boolean) => void;
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
  public componentDidMount() {
    this.setState({ visible: this.props.visible });

  }
  public shouldComponentUpdate(nextProps: IDialogProps, nextState: IDialogState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }


  public render(): React.ReactElement<IDialogProps> {
    try {
      const styleBlock = { "--lqdDialogHeight": "30vh", "--lqdDialogWidth": "40vw" } as React.CSSProperties;
      return (
        <div className="tmp-hidden">
          <div className={`lqd-mdldialog-outer  ${(this.props.visible) ? "is-visible" : ""}`}>
            <div className="lqd-mdldialog" style={styleBlock}>
              <div className="lqd-dlgheader">
                <div className="lqd-dlgheader-title">
                  <h2>{this.props.header}</h2>
                </div>
                <div className="lqd-dlgheader-closer">
                  <ButtonIcon iconType={Icons.Close} onClick={() => { this.props.onChange(false); }} />
                </div>
              </div>
              <div className="lqd-dlgcontent">
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