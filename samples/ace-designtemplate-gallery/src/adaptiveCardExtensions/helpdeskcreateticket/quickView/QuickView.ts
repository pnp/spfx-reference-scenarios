import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'HelpdeskcreateticketAdaptiveCardExtensionStrings';
import { HelpDeskTicket } from '../../../common/models/designtemplate.models';
import { ADDLOCATION_VIEW_REGISTRY_ID, IHelpdeskcreateticketAdaptiveCardExtensionProps, IHelpdeskcreateticketAdaptiveCardExtensionState } from '../HelpdeskcreateticketAdaptiveCardExtension';
import { cloneDeep } from '@microsoft/sp-lodash-subset';

export interface IQuickViewData {
  ticket: HelpDeskTicket;
  strings: IHelpdeskcreateticketAdaptiveCardExtensionStrings;
}

export class QuickView extends BaseAdaptiveCardView<
  IHelpdeskcreateticketAdaptiveCardExtensionProps,
  IHelpdeskcreateticketAdaptiveCardExtensionState,
  IQuickViewData
> {
  private LOG_SOURCE = "🔶 Help Desk Create Ticket Quick View";

  public get data(): IQuickViewData {
    return {
      ticket: this.state.ticket,
      strings: strings
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }

  public async onAction(action: IActionArguments): Promise<void> {
    try {
      const newTicket: HelpDeskTicket = cloneDeep(this.state.ticket);
      if (action.type === 'Submit') {
        const { id } = action.data;
        if (id === 'confirm') {
          newTicket.category = action.data?.category;
          newTicket.urgency = action.data?.urgency;
          newTicket.state = "New";
          newTicket.description = action.data?.description;
          this.setState({ ticket: newTicket });
          this.quickViewNavigator.push(ADDLOCATION_VIEW_REGISTRY_ID, false);
        } else {
          const newTicket: HelpDeskTicket = new HelpDeskTicket(this.state.ticket.incidentNumber, this.state.ticket.requestedBy, this.state.ticket.createDate, "", "", "New", "", "", "", "", "", false, "", []);
          this.setState({ ticket: newTicket });
          this.quickViewNavigator.close();
        }
      }
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (onAction) -- click event not handled. - ${err}`
      );
    }
  }
}