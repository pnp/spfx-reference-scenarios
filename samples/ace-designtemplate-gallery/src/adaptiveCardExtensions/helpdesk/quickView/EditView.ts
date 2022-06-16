import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments, ISubmitActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import { find } from '@microsoft/sp-lodash-subset';
import * as strings from 'HelpdeskAdaptiveCardExtensionStrings';
import { HelpDeskTicket } from '../../../common/models/designtemplate.models';
import { IHelpdeskAdaptiveCardExtensionProps, IHelpdeskAdaptiveCardExtensionState, QUICK_VIEW_REGISTRY_ID } from '../HelpdeskAdaptiveCardExtension';
import { Logger, LogLevel } from "@pnp/logging";
import { dtg } from '../../../common/services/designtemplate.service';

export interface IEditViewData {
  ticket: HelpDeskTicket;
  strings: IHelpdeskAdaptiveCardExtensionStrings;
}

export class EditView extends BaseAdaptiveCardView<
  IHelpdeskAdaptiveCardExtensionProps,
  IHelpdeskAdaptiveCardExtensionState,
  IEditViewData
> {
  private LOG_SOURCE: string = "🔶 Help Desk Edit View";

  public get data(): IEditViewData {
    let ticket: HelpDeskTicket = find(this.state.tickets, { incidentNumber: this.state.currentIncidentNumber });
    return {
      ticket: ticket,
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
      Logger.write(`${this.LOG_SOURCE} (onAction) - ${err}`, LogLevel.Error);
    }
  }
}