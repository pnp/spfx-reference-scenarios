import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { AppData, DeepLinkData, DeepLinkType } from "../../../../common/models/designtemplate.models";
import { isEqual } from "@microsoft/sp-lodash-subset";
import ButtonIcon from "../atoms/ButtonIcon";
import { Icons } from "../../../../common/models/icons";
import * as strings from "AceDesignTemplatePersonalAppWebPartStrings";


export interface IAppDetailsProps {
  appData: AppData;
  deepLink?: DeepLinkData;
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
            {this.props.deepLink &&
              <>
                <header className="hoo-teamsdbcard-header">
                  <div className="hoo-teamsdbcard-title">{strings.DeepLinkHeading}</div>
                </header>
                <p>{strings.DeepLinkContent}</p>
              </>
            }
            {!this.props.deepLink &&
              <>

              </>
            }
            <div className="hoo-teamsdbcard-content">

              {this.props.deepLink?.deepLinkType == DeepLinkType.EVENTREGISTRATION &&
                <div className="deepLinkCard">
                  <div className="introText">{strings.EventRegThankYouMessage.replace('__xxxx__', this.props.deepLink.message.eventTitle)}</div>
                  <span><span className="linkCardLabel">{`${strings.NameLabel}: `}</span>{`${this.props.deepLink.message.firstName} ${this.props.deepLink.message.lastName}`}</span>
                  <span><span className="linkCardLabel">{`${strings.CompanyNameLabel}: `}</span>{this.props.deepLink.message.company}</span>
                  <span><span className="linkCardLabel">{`${strings.PhoneLabel}: `}</span>{this.props.deepLink.message.phone}</span>
                </div>
              }
              {this.props.deepLink?.deepLinkType == DeepLinkType.ANNIVERSARY &&
                <div className="deepLinkCard">
                  <div className="introText">{strings.AnniversaryMessage}</div>
                  <span>{`${this.props.deepLink.message.firstName} ${this.props.deepLink.message.lastName}`}</span>
                  <span><span className="linkCardLabel">{`${strings.CelebratingLabel} `}</span>{this.props.deepLink.message.anniversaryDuration} {(this.props.deepLink.message.anniversaryDuration > 1) ? strings.YearsLabel : strings.YearLabel}</span>
                </div>
              }
              {this.props.deepLink?.deepLinkType == DeepLinkType.PRAISE &&
                <div className="deepLinkCard">
                  <div><img src={this.props.deepLink.message.imageUrl} /></div>
                  <div className="introText">{this.props.deepLink.message.title}</div>
                  <span>{this.props.deepLink.message.comment}</span>
                </div>
              }
              {this.props.deepLink?.deepLinkType == DeepLinkType.INVENTORYITEM &&
                <div className="deepLinkCard">
                  <div className="introText">{`${strings.InventoryMessage} ${this.props.deepLink.message.inventoryItem.name}`}</div>
                  <span><span className="linkCardLabel">{`${strings.InventoryAvailableLabel}: `}</span>{this.props.deepLink.message.inventoryItem.amount}</span>
                </div>
              }
              {this.props.deepLink?.deepLinkType == DeepLinkType.TEXT &&
                <div className="deepLinkCard">
                  <span>{strings.DeepLinkMessage.replace('__xxxx__', this.props.deepLink.message)}</span>
                </div>
              }

              <div className="hoo-teamsdbcard-title">{strings.CardViewHeading}</div>
              <p>{this.props.appData.appDescription}</p>
              <div className="hoo-cardimage"><img src={this.props.appData.appCardImage} alt={`${this.props.appData.appName} Card View Card`} /></div>



            </div>
          </article >
          <article className="hoo-teamsdbcard quickView">
            <header className="hoo-teamsdbcard-header">
              <div className="hoo-teamsdbcard-title">{strings.QuickViewHeading}</div>
            </header>
            <div className="hoo-teamsdbcard-content">
              <div className="hoo-cardimage quickview"><img className="quickview" src={this.props.appData.appQuickViewImage} alt={`${this.props.appData.appName} Quick View Card`} /></div>

            </div>
          </article>
          <article className="hoo-teamsdbcard">
            <header className="hoo-teamsdbcard-header">
              <div className="hoo-teamsdbcard-title">{strings.AboutHeading}</div>
            </header>
            <div className="hoo-teamsdbcard-content">
              <p>{strings.AboutContent}</p>
              <p>{strings.MoreInfoHeading}</p>
              <a href="https://adaptivecards.io/" className="hoo-button-primary" role="button" target="_blank">
                <div className="hoo-button-label">{strings.ACDocsButtonText}</div>
              </a>
              <a href="https://adaptivecards.io/" className="hoo-button" role="button" target="_blank">
                <div className="hoo-button-label">{strings.ACDesignerButtonText}</div>
              </a>
              <a href="https://docs.microsoft.com/en-us/sharepoint/dev/spfx/viva/get-started/build-first-sharepoint-adaptive-card-extension" className="hoo-button-primary" role="button" target="_blank">
                <div className="hoo-button-label">{strings.ACTutorialButtonText}</div>
              </a>
              <a href="https://docs.microsoft.com/en-us/sharepoint/dev/spfx/viva/design/design-intro" className="hoo-button" role="button" target="_blank">
                <div className="hoo-button-label">{strings.ACEDesignButtonText}</div>
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