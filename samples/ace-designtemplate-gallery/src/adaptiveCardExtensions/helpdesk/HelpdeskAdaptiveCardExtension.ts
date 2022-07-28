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

  public async onInit(): Promise<void> {
    try {
      this._iconProperty = this.properties.iconProperty;

      //Initialize Service
      await dtg.Init(this.context.serviceScope);

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
