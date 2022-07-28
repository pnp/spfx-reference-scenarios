import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments, ISubmitActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import { find } from '@microsoft/sp-lodash-subset';
import * as strings from 'HelpdeskAdaptiveCardExtensionStrings';
import { HelpDeskTicket } from '../../../common/models/designtemplate.models';
import { dtg } from '../../../common/services/designtemplate.service';
import { IHelpdeskAdaptiveCardExtensionProps, IHelpdeskAdaptiveCardExtensionState } from '../HelpdeskAdaptiveCardExtension';

export interface IEditViewData {
  ticket: HelpDeskTicket;
  ticketDirectionUrl: string;
  strings: IHelpdeskAdaptiveCardExtensionStrings;
}

export class EditView extends BaseAdaptiveCardView<
  IHelpdeskAdaptiveCardExtensionProps,
  IHelpdeskAdaptiveCardExtensionState,
  IEditViewData
> {
  private LOG_SOURCE: string = "🔶 Help Desk Edit View";

  public get data(): IEditViewData {
    const ticket: HelpDeskTicket = find(this.state.tickets, { incidentNumber: this.state.currentIncidentNumber });

    const directionsUrl: string = `https://www.bing.com/maps?rtp=~pos.${ticket.latitude}_${ticket.longitude}&rtop=0~1~0&lvl=15&toWww=1&redig=F0A0A658A50247FDB798711217D4CBF3`;
    return {
      ticket: ticket,
      ticketDirectionUrl: directionsUrl,
      strings: strings,
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/EditViewTemplate.json');
  }

  public async onAction(action: IActionArguments): Promise<void> {
    try {
      if ((<ISubmitActionArguments>action).type === 'Submit') {
        const submitAction = <ISubmitActionArguments>action;
        const { id, ticket } = submitAction.data;
        if (id === 'close') {
          this.quickViewNavigator.close();
          this.setState({ tickets: dtg.CloseHelpDeskTickets(this.state.tickets, ticket), currentIncidentNumber: "" });

        }
      }
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (onAction) -- click event not handled. - ${err}`
      );
    }
  }
}