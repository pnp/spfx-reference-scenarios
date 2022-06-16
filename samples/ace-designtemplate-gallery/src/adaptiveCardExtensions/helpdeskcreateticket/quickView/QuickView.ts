import { ISPFxAdaptiveCard, BaseAdaptiveCardView, ISubmitActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'HelpdeskcreateticketAdaptiveCardExtensionStrings';
import { HelpDeskTicket } from '../../../common/models/designtemplate.models';
import { CONFIRM_VIEW_REGISTRY_ID, IHelpdeskcreateticketAdaptiveCardExtensionProps, IHelpdeskcreateticketAdaptiveCardExtensionState } from '../HelpdeskcreateticketAdaptiveCardExtension';
import { Logger, LogLevel } from "@pnp/logging";

export interface IQuickViewData {
  ticket: HelpDeskTicket;
  strings: IHelpdeskcreateticketAdaptiveCardExtensionStrings;
}

export class QuickView extends BaseAdaptiveCardView<
  IHelpdeskcreateticketAdaptiveCardExtensionProps,
  IHelpdeskcreateticketAdaptiveCardExtensionState,
  IQuickViewData
> {
  private LOG_SOURCE: string = "🔶 Help Desk Create Ticket Quick View";

  public get data(): IQuickViewData {
    return {
      ticket: this.state.ticket,
      strings: strings
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }

  public async onAction(action: ISubmitActionArguments): Promise<void> {
    try {
      if (action.type === 'Submit') {
        const { id } = action.data;
        if (id === 'confirm') {
          const newTicket: HelpDeskTicket = new HelpDeskTicket(this.state.ticket.incidentNumber, this.state.ticket.requestedBy, this.state.ticket.createDate, action.data?.category, action.data?.urgency, action.data?.state, action.data?.description, action.data?.location);
          this.setState({ ticket: newTicket });
          this.quickViewNavigator.push(CONFIRM_VIEW_REGISTRY_ID, false);
        } else {
          this.quickViewNavigator.close();
        }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (onAction) - ${err}`, LogLevel.Error);
    }
  }
}