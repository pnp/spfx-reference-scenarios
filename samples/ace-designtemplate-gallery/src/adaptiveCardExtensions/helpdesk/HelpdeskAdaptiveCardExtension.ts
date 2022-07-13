import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { HelpdeskPropertyPane } from './HelpdeskPropertyPane';
import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";
import { dtg } from '../../common/services/designtemplate.service';
import { HelpDeskTicket } from '../../common/models/designtemplate.models';
import { EditView } from './quickView/EditView';

export interface IHelpdeskAdaptiveCardExtensionProps {
  title: string;
  iconProperty: string;
}

export interface IHelpdeskAdaptiveCardExtensionState {
  tickets: HelpDeskTicket[];
  currentIncidentNumber: string;
}

const CARD_VIEW_REGISTRY_ID: string = 'Helpdesk_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'Helpdesk_QUICK_VIEW';
export const EDITT_VIEW_REGISTRY_ID: string = 'Helpdesk_EDIT_VIEW';

export default class HelpdeskAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IHelpdeskAdaptiveCardExtensionProps,
  IHelpdeskAdaptiveCardExtensionState
> {
  private LOG_SOURCE: string = "🔶 Help Desk Ticket Listing Adaptive Card Extension";
  private _deferredPropertyPane: HelpdeskPropertyPane | undefined;


  public onInit(): Promise<void> {
    try {
      this._iconProperty = this.properties.iconProperty;
      //Initialize PnPLogger
      Logger.subscribe(new ConsoleListener());
      Logger.activeLogLevel = LogLevel.Info;

      //Initialize Service
      dtg.Init();

      const tickets: HelpDeskTicket[] = dtg.GetHelpDeskTickets();

      //Set the data into state
      this.state = {
        tickets: tickets,
        currentIncidentNumber: ""

      };
      //Register the cards
      this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
      this.quickViewNavigator.register(QUICK_VIEW_REGISTRY_ID, () => new QuickView());
      this.quickViewNavigator.register(EDITT_VIEW_REGISTRY_ID, () => new EditView());
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (onInit) - ${err}`, LogLevel.Error);
    }

    return Promise.resolve();
  }

  public get title(): string {
    return this.properties.title;
  }
  protected get iconProperty(): string {
    return this.properties.iconProperty || require('./assets/SharePointLogo.svg');
  }

  protected loadPropertyPaneResources(): Promise<void> {
    return import(
      /* webpackChunkName: 'Helpdesk-property-pane'*/
      './HelpdeskPropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.HelpdeskPropertyPane();
        }
      );
  }

  protected renderCard(): string | undefined {
    return CARD_VIEW_REGISTRY_ID;
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return this._deferredPropertyPane!.getPropertyPaneConfiguration();
  }
}
