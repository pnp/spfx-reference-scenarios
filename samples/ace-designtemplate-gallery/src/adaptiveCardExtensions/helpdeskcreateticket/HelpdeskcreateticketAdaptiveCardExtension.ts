import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { HelpdeskcreateticketPropertyPane } from './HelpdeskcreateticketPropertyPane';

import { dtg } from '../../common/services/designtemplate.service';
import { DemoUser, HelpDeskTicket } from '../../common/models/designtemplate.models';
import { random } from '@microsoft/sp-lodash-subset';
import { AddLocationImages } from './quickView/AddLocationImages';

export interface IHelpdeskcreateticketAdaptiveCardExtensionProps {
  title: string;
  iconProperty: string;
  bingMapsKey: string;
}

export interface IHelpdeskcreateticketAdaptiveCardExtensionState {
  ticket: HelpDeskTicket;
  listCreated: boolean;
}

const CARD_VIEW_REGISTRY_ID: string = 'Helpdeskcreateticket_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'Helpdeskcreateticket_QUICK_VIEW';
export const ADDLOCATION_VIEW_REGISTRY_ID: string = 'Helpdeskcreateticket_ADDLOCATION_VIEW';

export default class HelpdeskcreateticketAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IHelpdeskcreateticketAdaptiveCardExtensionProps,
  IHelpdeskcreateticketAdaptiveCardExtensionState
> {
  private LOG_SOURCE: string = "🔶 Help Desk Create Ticket Adaptive Card Extension";
  private _deferredPropertyPane: HelpdeskcreateticketPropertyPane | undefined;

  public async onInit(): Promise<void> {
    try {
      this._iconProperty = this.properties.iconProperty;

      //Initialize Service
      dtg.Init();

      //Create a new blank ticket
      const ticket: HelpDeskTicket = new HelpDeskTicket();
      const user: DemoUser = new DemoUser("0", this.context.pageContext.user.displayName, require('./assets/person.png'));
      const today: Date = new Date();
      ticket.incidentNumber = "INC" + random(11111, 99999, false).toString();
      ticket.createDate = `${today.getFullYear()}-${(today.getMonth() + 1 < 10) ? "0" : ""}${today.getMonth() + 1}-${(today.getDate() < 10) ? "0" : ""}${today.getDate()}T00:00:00Z`;
      ticket.requestedBy = user;

      //Set the data into state
      this.state = {
        ticket: ticket,
        listCreated: false
      };
      //Register the cards
      this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
      this.quickViewNavigator.register(QUICK_VIEW_REGISTRY_ID, () => new QuickView());
      this.quickViewNavigator.register(ADDLOCATION_VIEW_REGISTRY_ID, () => new AddLocationImages());
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (onInit) -- Could not initialize web part. - ${err}`
      );
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
          this._deferredPropertyPane = new component.HelpdeskcreateticketPropertyPane(this.context);
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
