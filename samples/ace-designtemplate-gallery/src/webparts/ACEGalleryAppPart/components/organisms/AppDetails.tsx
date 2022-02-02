import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { AppData, DeepLinkType } from "../../../../common/models/designtemplate.models";
import { isEqual } from "@microsoft/sp-lodash-subset";
import ButtonIcon from "../atoms/ButtonIcon";
import { Icons } from "../../../../common/models/icons";


export interface IAppDetailsProps {
  appData: AppData;
  onBackClick: () => void;
}

export interface IAppDetailsState {
}

export class AppDetailsState implements IAppDetailsState {
  constructor() { }
}

export default class AppDetails extends React.Component<IAppDetailsProps, IAppDetailsState> {
  private LOG_SOURCE: string = "🔶 AppDetails";

  constructor(props: IAppDetailsProps) {
    super(props);
    this.state = new AppDetailsState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IAppDetailsProps>, nextState: Readonly<IAppDetailsState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IAppDetailsProps> {
    try {
      return (
        <div className="hoo-teamsdb appDetails" data-component={this.LOG_SOURCE}>
          <div className="introText">
            <ButtonIcon
              iconType={Icons.LeftArrow}
              onClick={() => this.props.onBackClick()} />
          </div>


          <article className="hoo-teamsdbcard">
            {this.props.appData.deepLinkData &&
              <>
                <header className="hoo-teamsdbcard-header">
                  <div className="hoo-teamsdbcard-title">Deep Link</div>
                </header>
                <p>You clicked on a deep link from an Adaptive Card Extension.</p>
              </>
            }
            {!this.props.appData.deepLinkData &&
              <>
                <header className="hoo-teamsdbcard-header">
                  <div className="hoo-teamsdbcard-title">{this.props.appData.appName} App Card</div>
                </header>
                <p>You clicked into this app from Teams. To see this Adaptive Card Extensions in action add it to your dashboard and see how to deep link from an ACE to Teams.</p>
              </>
            }
            <div className="hoo-teamsdbcard-content">

              {this.props.appData.deepLinkData?.deepLinkType == DeepLinkType.EVENTREGISTRATION &&
                <div className="deepLinkCard">
                  <div className="introText">Thank you for registering for {this.props.appData.deepLinkData.eventRegistration.eventTitle}. Your registration has been confirmed with the following information.</div>
                  <span><span className="linkCardLabel">Name: </span>{this.props.appData.deepLinkData.eventRegistration.firstName} {this.props.appData.deepLinkData.eventRegistration.lastName}</span>
                  <span><span className="linkCardLabel">Company: </span>{this.props.appData.deepLinkData.eventRegistration.company}</span>
                  <span><span className="linkCardLabel">Phone: </span>{this.props.appData.deepLinkData.eventRegistration.phone}</span>
                </div>
              }
              {this.props.appData.deepLinkData?.deepLinkType == DeepLinkType.TEXT &&
                <div className="deepLinkCard">
                  <span><span className="linkCardLabel">You clicked on the: </span>{this.props.appData.deepLinkData.linkText}  link in the Adaptive Card.</span>
                </div>
              }
              <div className="hoo-teamsdbcard-title">Card View</div>
              <p>{this.props.appData.appDescription}</p>
              <div className="hoo-cardimage"><img src={this.props.appData.appCardImage} alt={`${this.props.appData.appName} Card View Card`} /></div>



            </div>
          </article >
          <article className="hoo-teamsdbcard quickView">
            <header className="hoo-teamsdbcard-header">
              <div className="hoo-teamsdbcard-title">Quick View</div>
            </header>
            <div className="hoo-teamsdbcard-content">
              <div className="hoo-cardimage quickview"><img className="quickview" src={this.props.appData.appQuickViewImage} alt={`${this.props.appData.appName} Quick View Card`} /></div>

            </div>
          </article>
          <article className="hoo-teamsdbcard">
            <header className="hoo-teamsdbcard-header">
              <div className="hoo-teamsdbcard-title">More Information About Adaptive Card Extensions</div>
            </header>
            <div className="hoo-teamsdbcard-content">
              <p>You can provide deep links from your Adaptive Card Extension into Teams linking directly to Teams Personal Apps, Teams Tabs, Chat, or Meetings.</p>
              <p>For More Information on Adaptive Card Extensions</p>
              <a href="https://adaptivecards.io/" className="hoo-button-primary" role="button" target="_blank">
                <div className="hoo-button-label">Adaptive Card Documentation</div>
              </a>
              <a href="https://adaptivecards.io/" className="hoo-button" role="button" target="_blank">
                <div className="hoo-button-label">Adaptive Card Designer</div>
              </a>
              <a href="https://docs.microsoft.com/en-us/sharepoint/dev/spfx/viva/get-started/build-first-sharepoint-adaptive-card-extension" className="hoo-button-primary" role="button" target="_blank">
                <div className="hoo-button-label">Build Your First Adaptive Card Extension</div>
              </a>
              <a href="https://docs.microsoft.com/en-us/sharepoint/dev/spfx/viva/design/design-intro" className="hoo-button" role="button" target="_blank">
                <div className="hoo-button-label">Designing Viva Connections Custom Cards</div>
              </a>
            </div>
          </article>
        </div >

      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}