import {
  BasePrimaryTextCardView,
  IPrimaryTextCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction
} from '@microsoft/sp-adaptive-card-extension-base';
import { cloneDeep } from '@microsoft/sp-lodash-subset';
import * as strings from 'TeamcalendarAdaptiveCardExtensionStrings';
import { Appointment } from '../../../common/models/designtemplate.models';
import { ITeamcalendarAdaptiveCardExtensionProps, ITeamcalendarAdaptiveCardExtensionState, QUICK_VIEW_REGISTRY_ID } from '../TeamcalendarAdaptiveCardExtension';

export class CardView extends BasePrimaryTextCardView<ITeamcalendarAdaptiveCardExtensionProps, ITeamcalendarAdaptiveCardExtensionState> {
  public get data(): IPrimaryTextCardParameters {
    const appointments: Appointment[] = cloneDeep(this.state.selectedAppointments);
    const OOO: Appointment[] = appointments.filter(appt => appt.appointmentType.toString() == "OOO");
    let cardText = "";
    if (appointments.length > 0) {
      if (OOO.length > 0) {
        cardText += `${OOO.length} ${(OOO.length > 1) ? strings.OOFTextPlural : strings.OOFTextSingular}`;
      }
      if (appointments.length - OOO.length > 0) {
        cardText += `${(cardText.length > 0) ? "," : ""} ${appointments.length - OOO.length} ${(appointments.length - OOO.length > 1) ? strings.TaskTextPlural : strings.TaskTextSingular}`;
      }
    } else {
      cardText = strings.NoItems;
    }
    return {
      primaryText: strings.CardViewTitle,
      description: cardText
    };
  }

  public get onCardSelection(): IQuickViewCardAction | IExternalLinkCardAction | undefined {
    return {
      type: 'QuickView',
      parameters: {
        view: QUICK_VIEW_REGISTRY_ID
      }
    };
  }
}
