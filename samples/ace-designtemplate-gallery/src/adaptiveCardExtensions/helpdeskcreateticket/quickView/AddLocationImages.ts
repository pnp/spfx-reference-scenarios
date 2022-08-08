import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments, ISelectMediaAttachment, ISelectMediaActionErrorArguments } from '@microsoft/sp-adaptive-card-extension-base';
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
  errorMessage: string;
  strings: IHelpdeskcreateticketAdaptiveCardExtensionStrings;
}

export class AddLocationImages extends BaseAdaptiveCardView<
  IHelpdeskcreateticketAdaptiveCardExtensionProps,
  IHelpdeskcreateticketAdaptiveCardExtensionState,
  IAddLocationImagesData
> {
  private LOG_SOURCE = "🔶 Help Desk Create Ticket Add Location View";

  public get data(): IAddLocationImagesData {
    const hasAPIKey: boolean = (this.properties.bingMapsKey !== '') ? true : false;
    return {
      ticket: this.state.ticket,
      imgAdd: require('../assets/add.svg'),
      imgChecked: require('../assets/check.svg'),
      hasAPIKey: hasAPIKey,
      canUpload: this.properties.canUpload,
      confirmLink: dtg.GetHelpDeskTicketLink(this.state.ticket),
      errorMessage: this.state.errorMessage,
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
        newTicket.latitude = action.location.latitude.toString();
        newTicket.longitude = action.location.longitude.toString();
        newTicket.location = await dtg.GetLocationData(newTicket.latitude, newTicket.longitude, this.properties.bingMapsKey);
        this.setState({
          ticket: newTicket
        });
      }
      else if (action.type == "VivaAction.SelectMedia") {
        const images: ISelectMediaAttachment[] = action.media
        if (images) {
          images.map(async (image) => {
            const fileName: string = image.fileName;
            const content: string = image.content;
            //File contents come in as a data url need to convert to bytearray to add to SP Library
            const fileContents = content.replace('data:', '').replace(/^.+,/, '');
            const byteCharacters = atob(fileContents);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const result: boolean = await dtg.AddImage("HelpDeskTickets", fileName, byteArray);
            if (result) {
              newTicket.imageNames.push(fileName);
              this.setState({
                ticket: newTicket,
                errorMessage: ""
              });
            }
          })
        }
      }
      else if (action.type === 'Submit') {
        const { id } = action.data;
        if (id === 'cancel') {
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
  public onActionError(error: ISelectMediaActionErrorArguments): void {
    try {
      if (error.type === 'VivaAction.SelectMedia') {
        this.setState({
          errorMessage: error.media[0].error.errorCode
        });
      }

    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (onAction) -- click event not handled. - ${err}`
      );
    }
  }
}