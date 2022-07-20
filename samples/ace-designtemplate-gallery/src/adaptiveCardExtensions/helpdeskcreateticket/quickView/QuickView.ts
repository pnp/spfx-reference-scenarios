import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'HelpdeskcreateticketAdaptiveCardExtensionStrings';
import { HelpDeskTicket } from '../../../common/models/designtemplate.models';
import { CONFIRM_VIEW_REGISTRY_ID, IHelpdeskcreateticketAdaptiveCardExtensionProps, IHelpdeskcreateticketAdaptiveCardExtensionState } from '../HelpdeskcreateticketAdaptiveCardExtension';
import { Logger, LogLevel } from "@pnp/logging";
import { cloneDeep } from '@microsoft/sp-lodash-subset';

export interface IQuickViewData {
  ticket: HelpDeskTicket;
  imgAdd: string;
  imgChecked: string;
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
      imgAdd: require('../assets/add.svg'),
      imgChecked: require('../assets/check.svg'),
      strings: strings
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }

  public async onAction(action: IActionArguments): Promise<void> {
    try {
      const newTicket: HelpDeskTicket = cloneDeep(this.state.ticket);
      if (action.type === 'VivaAction.GetLocation') {
        //If you want to get the actual location title
        //Here you would use the lat/long to call a maps API.
        //Not included here as it would require an API key
        newTicket.latitude = action.location.latitude.toString();
        newTicket.longitude = action.location.longitude.toString();
        this.setState({
          ticket: newTicket
        });
      }
      else if (action.type === 'Submit') {
        const { id } = action.data;
        if (id === 'confirm') {
          newTicket.category = action.data?.category;
          newTicket.urgency = action.data?.urgency;
          newTicket.state = action.data?.state;
          newTicket.description = action.data?.description;
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