import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "@microsoft/sp-lodash-subset";
import { AppData } from "../../../../common/models/designtemplate.models";
import AppCard from "../molecules/AppCard";

export interface IAppListProps {
  appList: AppData[];
  onCardClick: (AppData) => void;
}

export interface IAppListState {
}

export class AppListState implements IAppListState {
  constructor() { }
}

export default class AppList extends React.Component<IAppListProps, IAppListState> {
  private LOG_SOURCE: string = "🔶 AppList";

  constructor(props: IAppListProps) {
    super(props);
    this.state = new AppListState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IAppListProps>, nextState: Readonly<IAppListState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IAppListProps> {
    try {
      return (
        <div className="hoo-cardgrid" data-component={this.LOG_SOURCE}>
          <div className="introText">
            <h1>Adaptive Card Extension - Design Examples</h1>
            <p>Samples on different Adaptive Card designs demonstrating the art of possible for inspiration and innovation. Shared designs can be used as such or as a starting point for your own designs.</p>
            <p>Click on a card to see more details about the sample and get more information about developing your own Adaptive Card Extensions using SPFx.</p>
          </div>
          {this.props.appList.map((app) => {
            return (
              <AppCard app={app} onCardClick={this.props.onCardClick} />
            );
          })
          }
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
