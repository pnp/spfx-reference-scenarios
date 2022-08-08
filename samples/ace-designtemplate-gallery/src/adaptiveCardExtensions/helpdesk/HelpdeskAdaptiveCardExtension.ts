import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { HelpdeskPropertyPane } from './HelpdeskPropertyPane';

import { HelpDeskTicket } from '../../common/models/designtemplate.models';
import { EditView } from './quickView/EditView';
import { dtg } from '../../common/services/designtemplate.service';

export interface IHelpdeskAdaptiveCardExtensionProps {
  title: string;
  iconProperty: string;
  bingMapsKey: string;
  listExists: boolean;
  canUpload: boolean;
  currentLat: string;
  currentLong: string;
}

export interface IHelpdeskAdaptiveCardExtensionState {
  tickets: HelpDeskTicket[];
  currentIncidentNumber: string;
  errorMessage: string;
}

const CARD_VIEW_REGISTRY_ID = 'Helpdesk_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID = 'Helpdesk_QUICK_VIEW';
export const EDITT_VIEW_REGISTRY_ID = 'Helpdesk_EDIT_VIEW';

export default class HelpdeskAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IHelpdeskAdaptiveCardExtensionProps,
  IHelpdeskAdaptiveCardExtensionState
> {
  private LOG_SOURCE = "🔶 Help Desk Ticket Listing Adaptive Card Extension";
  private _deferredPropertyPane: HelpdeskPropertyPane | undefined;
  private _listExists = false;

  public async onInit(): Promise<void> {
    try {
      this._iconProperty = this.properties.iconProperty;

      //Initialize Service
      await dtg.Init(this.context.serviceScope);
      //Check if the list to hold the images exists
      this._listExists = await dtg.CheckList("HelpDeskTickets");
      // this.properties.listExists = this._listExists;

      if (this._listExists) {
        this.properties.canUpload = await dtg.CanUserUpload("HelpDeskTickets");
        this.properties.canUpload = true;
      } else {
        this.properties.canUpload = false;
      }

      const tickets: HelpDeskTicket[] = await dtg.GetHelpDeskTickets(this.properties.bingMapsKey);

      //Set the data into state
      this.state = {
        tickets: tickets,
        currentIncidentNumber: "",
        errorMessage: ""

      };
      //Register the cards
      this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
      this.quickViewNavigator.register(QUICK_VIEW_REGISTRY_ID, () => new QuickView());
      this.quickViewNavigator.register(EDITT_VIEW_REGISTRY_ID, () => new EditView());
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
      /* webpackChunkName: 'Helpdesk-property-pane'*/
      './HelpdeskPropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.HelpdeskPropertyPane(this._listExists, this.context);
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
