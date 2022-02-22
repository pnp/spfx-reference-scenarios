import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "@microsoft/sp-lodash-subset";
import { AppData } from "../../../../common/models/designtemplate.models";
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
        <>
          <h2 className="introText">{strings.AppTitle}</h2>
          <div className="introText">{strings.AppListIntroContent}</div>
          <div className="hoo-teamsdb appDetails appList" data-component={this.LOG_SOURCE}>
            {this.props.appList.map((app) => {
              return (
                <article className="hoo-teamsdbcard quickView" onClick={() => this.props.onCardClick(app)}>
                  <header className="hoo-teamsdbcard-header">
                    <div className="hoo-teamsdbcard-title">{app.appName}</div>
                  </header>
                  <div className="hoo-teamsdbcard-content">
                    {app.appDescription}
                    <div className="hoo-cardimage"><img className="cardview" src={app.appCardImage} alt={`${app.appName} Card View`} /></div>
                  </div>
                </article>
              );
            })
            }
          </div >
        </>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
