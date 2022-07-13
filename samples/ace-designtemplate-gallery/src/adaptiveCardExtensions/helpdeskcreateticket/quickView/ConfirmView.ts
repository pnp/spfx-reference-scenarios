import { ISPFxAdaptiveCard, BaseAdaptiveCardView, ISubmitActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'HelpdeskcreateticketAdaptiveCardExtensionStrings';
import { HelpDeskTicket } from '../../../common/models/designtemplate.models';
import { IHelpdeskcreateticketAdaptiveCardExtensionProps, IHelpdeskcreateticketAdaptiveCardExtensionState } from '../HelpdeskcreateticketAdaptiveCardExtension';
import { Logger, LogLevel } from "@pnp/logging";
import { dtg } from '../../../common/services/designtemplate.service';

export interface IConfirmViewData {
  ticket: HelpDeskTicket;
  strings: IHelpdeskcreateticketAdaptiveCardExtensionStrings;
  confirmLink: string;
}

export class ConfirmView extends BaseAdaptiveCardView<
  IHelpdeskcreateticketAdaptiveCardExtensionProps,
  IHelpdeskcreateticketAdaptiveCardExtensionState,
  IConfirmViewData
> {
  private LOG_SOURCE: string = "🔶 Help Desk Create Ticket Confirm View";

  public get data(): IConfirmViewData {
    return {
      ticket: this.state.ticket,
      strings: strings,
      confirmLink: dtg.GetHelpDeskTicketLink(this.state.ticket)
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/ConfirmViewTemplate.json');
  }

  public async onAction(action: ISubmitActionArguments): Promise<void> {
    try {
      if (action.type === 'Submit') {
        const { id } = action.data;
        if (id === 'cancel') {
          const newTicket: HelpDeskTicket = new HelpDeskTicket(this.state.ticket.incidentNumber, this.state.ticket.requestedBy, this.state.ticket.createDate, "", "", "", "", "");
          this.setState({ ticket: newTicket });
          this.quickViewNavigator.close();
        }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (onAction) - ${err}`, LogLevel.Error);
    }
  }
}