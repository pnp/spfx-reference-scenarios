import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'HelpdeskcreateticketAdaptiveCardExtensionStrings';
import { HelpDeskTicket } from '../../../common/models/designtemplate.models';
import { IHelpdeskcreateticketAdaptiveCardExtensionProps, IHelpdeskcreateticketAdaptiveCardExtensionState } from '../HelpdeskcreateticketAdaptiveCardExtension';
import { cloneDeep } from '@microsoft/sp-lodash-subset';
import { dtg } from '../../../common/services/designtemplate.service';

export interface IAddLocationImagesData {
  ticket: HelpDeskTicket;
  imgAdd: string;
  imgChecked: string;
  hasAPIKey: boolean;
  canUpload: boolean
  confirmLink: string;
  strings: IHelpdeskcreateticketAdaptiveCardExtensionStrings;
}

export class AddLocationImages extends BaseAdaptiveCardView<
  IHelpdeskcreateticketAdaptiveCardExtensionProps,
  IHelpdeskcreateticketAdaptiveCardExtensionState,
  IAddLocationImagesData
> {
  private LOG_SOURCE: string = "🔶 Help Desk Create Ticket Add Location View";

  public get data(): IAddLocationImagesData {
    const hasAPIKey: boolean = (this.properties.bingMapsKey !== '') ? true : false;
    return {
      ticket: this.state.ticket,
      imgAdd: require('../assets/add.svg'),
      imgChecked: require('../assets/check.svg'),
      hasAPIKey: hasAPIKey,
      canUpload: this.properties.canUpload,
      confirmLink: dtg.GetHelpDeskTicketLink(this.state.ticket),
      strings: strings
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/AddLocationTemplate.json');
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
        newTicket.location = await dtg.GetLocationData(newTicket.latitude, newTicket.longitude, this.properties.bingMapsKey);
        this.setState({
          ticket: newTicket
        });
      }
      else if (action.type === 'Submit') {
        const { id } = action.data;
        if (id === 'cancel') {
          const newTicket: HelpDeskTicket = new HelpDeskTicket(this.state.ticket.incidentNumber, this.state.ticket.requestedBy, this.state.ticket.createDate, "", "", "New", "", "", "", "", "", false, "", "");
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