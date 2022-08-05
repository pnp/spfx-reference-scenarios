import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments, ISelectMediaAttachment, ISelectMediaActionErrorArguments } from '@microsoft/sp-adaptive-card-extension-base';
import { find } from '@microsoft/sp-lodash-subset';
import * as strings from 'HelpdeskAdaptiveCardExtensionStrings';
import { HelpDeskTicket } from '../../../common/models/designtemplate.models';
import { dtg } from '../../../common/services/designtemplate.service';
import { IHelpdeskAdaptiveCardExtensionProps, IHelpdeskAdaptiveCardExtensionState } from '../HelpdeskAdaptiveCardExtension';

export interface IEditViewData {
  ticket: HelpDeskTicket;
  ticketDirectionUrl: string;
  canUpload: boolean;
  errorMessage: string;
  strings: IHelpdeskAdaptiveCardExtensionStrings;
}

export class EditView extends BaseAdaptiveCardView<
  IHelpdeskAdaptiveCardExtensionProps,
  IHelpdeskAdaptiveCardExtensionState,
  IEditViewData
> {
  private LOG_SOURCE = "🔶 Help Desk Edit View";

  public get data(): IEditViewData {
    let currentLocation = "";
    const ticket: HelpDeskTicket = find(this.state.tickets, { incidentNumber: this.state.currentIncidentNumber });
    if (this.properties.currentLat && this.properties.currentLong) {
      currentLocation = `pos.${this.properties.currentLat}_${this.properties.currentLong}`;
    }


    const directionsUrl = `https://www.bing.com/maps?rtp=${currentLocation}~pos.${ticket.latitude}_${ticket.longitude}&rtop=0~1~0&lvl=15&toWww=1&redig=F0A0A658A50247FDB798711217D4CBF3`;
    return {
      ticket: ticket,
      ticketDirectionUrl: directionsUrl,
      canUpload: this.properties.canUpload,
      errorMessage: this.state.errorMessage,
      strings: strings,
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/EditViewTemplate.json');
  }

  public async onAction(action: IActionArguments): Promise<void> {
    try {
      if (action.type === 'Submit') {
        const { id, ticket } = action.data;
        if (id === 'close') {
          this.quickViewNavigator.close();
          this.setState({ tickets: dtg.CloseHelpDeskTickets(this.state.tickets, ticket), currentIncidentNumber: "" });

        }
      }
      else if (action.type == "VivaAction.SelectMedia") {
        const ticket: HelpDeskTicket = find(this.state.tickets, { incidentNumber: this.state.currentIncidentNumber });
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
              ticket.imageNames.push(fileName);
              this.setState({
                currentIncidentNumber: ticket.incidentNumber,
                errorMessage: ""
              });
            }
          })
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