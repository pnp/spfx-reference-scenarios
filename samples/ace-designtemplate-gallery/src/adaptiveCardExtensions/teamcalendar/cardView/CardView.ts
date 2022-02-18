import {
  BasePrimaryTextCardView,
  IPrimaryTextCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction,
  ICardButton
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'TeamcalendarAdaptiveCardExtensionStrings';
import { Appointment, AppointmentType } from '../../../common/models/designtemplate.models';
import { dtg } from '../../../common/services/designtemplate.service';
import { ITeamcalendarAdaptiveCardExtensionProps, ITeamcalendarAdaptiveCardExtensionState, QUICK_VIEW_REGISTRY_ID } from '../TeamcalendarAdaptiveCardExtension';

export class CardView extends BasePrimaryTextCardView<ITeamcalendarAdaptiveCardExtensionProps, ITeamcalendarAdaptiveCardExtensionState> {
  public get data(): IPrimaryTextCardParameters {
    const appointments: Appointment[] = dtg.GetThisWeekData(new Date());
    let OOO: Appointment[] = appointments.filter(appt => appt.appointmentType.toString() == "OOO");
    let cardText: string = "";
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
