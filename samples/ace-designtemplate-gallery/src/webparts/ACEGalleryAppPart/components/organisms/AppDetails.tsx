import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { AppData, DeepLinkData, DeepLinkType } from "../../../../common/models/designtemplate.models";
import { isEqual } from "@microsoft/sp-lodash-subset";
import { Icons } from "../../../../common/models/icons";
import * as strings from "AceDesignTemplatePersonalAppWebPartStrings";
import InventoryItem from "../molecules/InventoryItem";
import ButtonAction from "../atoms/ButtonAction";
import ButtonIcon from "../atoms/ButtonIcon";


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
        <>
          <div className="backButton">
            <ButtonAction
              iconType={Icons.LeftArrow}
              onClick={() => this.props.onBackClick()}
              buttonText={strings.BackButtonText} />
          </div>
          <h2 className="introText">{strings.AppTitle}</h2>
          <div className="introText">{strings.AppListIntroContent}</div>

          <div className="hoo-teamsdb appDetails" data-component={this.LOG_SOURCE}>
            <article className="hoo-teamsdbcard">
              <header className="hoo-teamsdbcard-header">
                <div className="hoo-teamsdbcard-title">{this.props.appData.appName}</div>
              </header>
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
                  <div className="deepLinkCard introText">
                    <div className="introText">{strings.EventRegThankYouMessage.replace('__xxxx__', this.props.deepLink.message.eventTitle)}</div>
                    <span><span className="linkCardLabel">{`${strings.NameLabel}: `}</span>{`${this.props.deepLink.message.firstName} ${this.props.deepLink.message.lastName}`}</span>
                    <span><span className="linkCardLabel">{`${strings.CompanyNameLabel}: `}</span>{this.props.deepLink.message.company}</span>
                    <span><span className="linkCardLabel">{`${strings.PhoneLabel}: `}</span>{this.props.deepLink.message.phone}</span>
                  </div>
                }
                {this.props.deepLink?.deepLinkType == DeepLinkType.ANNIVERSARY &&
                  <div className="deepLinkCard introText">
                    <div className="introText">{strings.AnniversaryMessage}</div>
                    <span>{`${this.props.deepLink.message.firstName} ${this.props.deepLink.message.lastName}`}</span>
                    <span><span className="linkCardLabel">{`${strings.CelebratingLabel} `}</span>{this.props.deepLink.message.anniversaryDuration} {(this.props.deepLink.message.anniversaryDuration > 1) ? strings.YearsLabel : strings.YearLabel}</span>
                  </div>
                }
                {this.props.deepLink?.deepLinkType == DeepLinkType.PRAISE &&
                  <div className="deepLinkCard introText">
                    <div className="introText">{strings.PraiseMessage}</div>
                    <div><img src={this.props.deepLink.message.imageUrl} /></div>
                    <div className="introText">{this.props.deepLink.message.title}</div>
                    <span>{this.props.deepLink.message.comment}</span>
                  </div>
                }
                {this.props.deepLink?.deepLinkType == DeepLinkType.TIMEOFFREQUEST &&
                  <div className="deepLinkCard introText">
                    <div className="introText">{strings.TimeOffMessage}</div>
                    <span><span className="linkCardLabel">{`${strings.RequestTypeLabel}: `}</span>{`${this.props.deepLink.message.requestType}`}</span>
                    <span><span className="linkCardLabel">{`${strings.DateLabel}: `}</span>{`${new Date(this.props.deepLink.message.date).toDateString()}`}</span>
                  </div>
                }
                {this.props.deepLink?.deepLinkType == DeepLinkType.VACCINATIONBOOSTER &&
                  <div className="deepLinkCard introText">
                    <div className="introText">{strings.VaccineApptMessage}</div>
                    <span><span className="linkCardLabel">{`${strings.RequestTypeLabel}: `}</span>{`${this.props.deepLink.message.boosterVaccineBrand}`}</span>
                    <span><span className="linkCardLabel">{`${strings.DateLabel}: `}</span>{`${new Date(this.props.deepLink.message.apptDate).toDateString()}`}</span>
                  </div>
                }
                {this.props.deepLink?.deepLinkType == DeepLinkType.HELPDESKTICKET &&
                  <div className="deepLinkCard introText">
                    <div className="introText">{strings.HelpDeskCreateTicketMessage}</div>
                    <span><span className="linkCardLabel">{`${strings.IncidentNumberLabel}: `}</span>{`${this.props.deepLink.message.incidentNumber}`}</span>
                    <span><span className="linkCardLabel">{`${strings.RequestedByLabel}: `}</span>{this.props.deepLink.message.requestedBy.displayName}</span>
                    <span><span className="linkCardLabel">{`${strings.CreateDateLabel}: `}</span>{new Date(this.props.deepLink.message.createDate).toDateString()}</span>
                    <span><span className="linkCardLabel">{`${strings.CategoryLabel}: `}</span>{this.props.deepLink.message.category}</span>
                    <span><span className="linkCardLabel">{`${strings.UrgencyLabel}: `}</span>{this.props.deepLink.message.urgency}</span>
                    <span><span className="linkCardLabel">{`${strings.StateLabel}: `}</span>{this.props.deepLink.message.state}</span>
                    <span><span className="linkCardLabel">{`${strings.DescriptionLabel}: `}</span>{this.props.deepLink.message.description}</span>
                  </div>
                }
                {this.props.deepLink?.deepLinkType == DeepLinkType.INVENTORYITEM &&
                  <InventoryItem introText={`${strings.InventoryMessage} ${this.props.deepLink.message.inventoryItem.name}`} label={strings.InventoryAvailableLabel} value={this.props.deepLink.message.inventoryItem.amount} />
                }
                {this.props.deepLink?.deepLinkType == DeepLinkType.TEXT &&
                  <div className="deepLinkCard introText">
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
                <a href={strings.DesignGuidelinesButtonLink} className="hoo-button-primary" role="button" target="_blank">
                  <div className="hoo-button-label">{strings.DesignGuidelinesButtonText}</div>
                </a>
                <a href={this.props.appData.appGitHubLink} className="hoo-button" role="button" target="_blank">
                  <div className="hoo-button-label">{strings.ViewSampleButtonText}</div>
                </a>
                <a href={this.props.appData.appDesignerLink} className="hoo-button-primary" role="button" target="_blank">
                  <div className="hoo-button-label">{strings.ACDesignerButtonText}</div>
                </a>
                <a href={strings.LearnACButtonLink} className="hoo-button" role="button" target="_blank">
                  <div className="hoo-button-label">{strings.LearnACButtonText}</div>
                </a>
                <a href={strings.ACTutorialButtonLink} className="hoo-button-primary" role="button" target="_blank">
                  <div className="hoo-button-label">{strings.ACTutorialButtonText}</div>
                </a>
              </div>
            </article>
          </div >
        </>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}