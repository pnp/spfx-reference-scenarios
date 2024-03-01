import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments, ISubmitActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'HelpdeskAdaptiveCardExtensionStrings';
import { HelpDeskTicket } from '../../../common/models/designtemplate.models';
import { EDITT_VIEW_REGISTRY_ID, IHelpdeskAdaptiveCardExtensionProps, IHelpdeskAdaptiveCardExtensionState } from '../HelpdeskAdaptiveCardExtension';

export interface IQuickViewData {
  numberOfTasks: string;
  tickets: HelpDeskTicket[];
  strings: IHelpdeskAdaptiveCardExtensionStrings;
}

export class QuickView extends BaseAdaptiveCardView<
  IHelpdeskAdaptiveCardExtensionProps,
  IHelpdeskAdaptiveCardExtensionState,
  IQuickViewData
> {
  private LOG_SOURCE = "🔶 Help Desk Quick View";

  public get data(): IQuickViewData {
    let numberOfTasks: string = strings.CardViewNoTasks;
    if (this.state.tickets.length > 1) {
      numberOfTasks = `${this.state.tickets.length.toString()} ${strings.CardViewTextPlural}`;
    } else {
      numberOfTasks = `${this.state.tickets.length.toString()} ${strings.CardViewTextSingular}`;
    }
    return {
      numberOfTasks: numberOfTasks,
      tickets: this.state.tickets,
      strings: strings,
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }

  public async onAction(action: IActionArguments): Promise<void> {
    try {
      if ((<ISubmitActionArguments>action).type === 'Submit') {
        const submitAction = <ISubmitActionArguments>action;
        const { id, incidentNumber } = submitAction.data;
        if (id === 'selectTicket') {
          this.setState({ currentIncidentNumber: incidentNumber });
          this.quickViewNavigator.push(EDITT_VIEW_REGISTRY_ID);
        }
      }
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (onAction) -- click event not handled. - ${err}`
      );
    }
  }
}