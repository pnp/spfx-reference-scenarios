import * as React from "react";
import { AppData } from "../../../../common/models/designtemplate.models";
import * as strings from "AceDesignTemplatePersonalAppWebPartStrings";

export interface IAppListProps {
  appList: AppData[];
  onCardClick: (AppData) => void;
}

export default class AppList extends React.Component<IAppListProps> {
  private LOG_SOURCE = "🔶 AppList";

  constructor(props: IAppListProps) {
    super(props);
  }

  public render(): React.ReactElement<IAppListProps> {
    try {
      return (
        <>
          <h2 className="introText">{strings.AppTitle}</h2>
          <div className="introText">{strings.AppListIntroContent}</div>
          <div className="hoo-teamsdb appDetails appList" data-component={this.LOG_SOURCE}>
            {this.props.appList.map((app, index) => {
              return (
                <article className="hoo-teamsdbcard quickView" onClick={() => this.props.onCardClick(app)} key={app.appName + index}>
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
      console.error(
        `${this.LOG_SOURCE} (render) - error rendering component ${err}`
      );
      return null;
    }
  }
}
