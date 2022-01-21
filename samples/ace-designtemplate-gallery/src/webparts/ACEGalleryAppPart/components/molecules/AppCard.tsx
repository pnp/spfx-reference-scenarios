import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "@microsoft/sp-lodash-subset";
import { AppData } from "../../../../common/models/designtemplate.models";

export interface IAppCardProps {
  app: AppData;
  onCardClick: (AppData) => void;
}

export interface IAppCardState {
}

export class AppCardState implements IAppCardState {
  constructor() { }
}

export default class AppCard extends React.Component<IAppCardProps, IAppCardState> {
  private LOG_SOURCE: string = "🔶 AppCard";

  constructor(props: IAppCardProps) {
    super(props);
    this.state = new AppCardState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IAppCardProps>, nextState: Readonly<IAppCardState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IAppCardProps> {
    try {
      return (

        <div className="hoo-doccard" data-component={this.LOG_SOURCE} onClick={() => this.props.onCardClick(this.props.app)}>
          <div className="hoo-cardimage">
            <img src={this.props.app.appCardImage} width="320" height="180" alt="" />
          </div>
          <div className="hoo-cardlocation">{this.props.app.appName}</div>
          <div className="hoo-cardfooter">
            <div className="hoo-cardfooter-data">
              <div className="hoo-cardfooter-name">{this.props.app.appDescription}</div>
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