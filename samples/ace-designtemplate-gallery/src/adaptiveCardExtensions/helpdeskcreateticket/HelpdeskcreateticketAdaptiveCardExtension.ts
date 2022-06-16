import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { HelpdeskcreateticketPropertyPane } from './HelpdeskcreateticketPropertyPane';

import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";
import { dtg } from '../../common/services/designtemplate.service';
import { DemoUser, HelpDeskTicket } from '../../common/models/designtemplate.models';
import { ConfirmView } from './quickView/ConfirmView';
import { random } from '@microsoft/sp-lodash-subset';

export interface IHelpdeskcreateticketAdaptiveCardExtensionProps {
  title: string;
  iconProperty: string;
}

export interface IHelpdeskcreateticketAdaptiveCardExtensionState {
  ticket: HelpDeskTicket;
}

const CARD_VIEW_REGISTRY_ID: string = 'Helpdeskcreateticket_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'Helpdeskcreateticket_QUICK_VIEW';
export const CONFIRM_VIEW_REGISTRY_ID: string = 'Helpdeskcreateticket_CONFIRM_VIEW';

export default class HelpdeskcreateticketAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IHelpdeskcreateticketAdaptiveCardExtensionProps,
  IHelpdeskcreateticketAdaptiveCardExtensionState
> {
  private LOG_SOURCE: string = "🔶 Help Desk Create Ticket Adaptive Card Extension";
  private _deferredPropertyPane: HelpdeskcreateticketPropertyPane | undefined;

  public onInit(): Promise<void> {
    try {
      this._iconProperty = this.properties.iconProperty;
      //Initialize PnPLogger
      Logger.subscribe(new ConsoleListener());
      Logger.activeLogLevel = LogLevel.Info;

      //Initialize Service
      dtg.Init();

      //Create a new blank ticket
      let ticket: HelpDeskTicket = new HelpDeskTicket();
      let user: DemoUser = new DemoUser("0", this.context.pageContext.user.displayName, require('./assets/person.png'));
      let today: Date = new Date();
      ticket.incidentNumber = "INC" + random(11111, 99999, false).toString();
      ticket.createDate = `${today.getFullYear()}-${(today.getMonth() + 1 < 10) ? "0" : ""}${today.getMonth() + 1}-${today.getDate()}T00:00:00Z`;
      ticket.requestedBy = user;

      //Set the data into state
      this.state = {
        ticket: ticket
      };
      //Register the cards
      this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
      this.quickViewNavigator.register(QUICK_VIEW_REGISTRY_ID, () => new QuickView());
      this.quickViewNavigator.register(CONFIRM_VIEW_REGISTRY_ID, () => new ConfirmView());
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
      /* webpackChunkName: 'Helpdeskcreateticket-property-pane'*/
      './HelpdeskcreateticketPropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.HelpdeskcreateticketPropertyPane();
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
