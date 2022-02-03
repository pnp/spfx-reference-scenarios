import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "@microsoft/sp-lodash-subset";
import { AppData } from "../../../../common/models/designtemplate.models";
import AppCard from "../molecules/AppCard";
import * as strings from "AceDesignTemplatePersonalAppWebPartStrings";

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
            <h1>{strings.AppTitle}</h1>
            <p>{strings.AppListIntroContent}</p>
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
