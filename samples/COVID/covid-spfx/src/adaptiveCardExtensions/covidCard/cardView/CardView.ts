import {
  BasePrimaryTextCardView,
  IPrimaryTextCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction,
  ICardButton
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'CovidCardAdaptiveCardExtensionStrings';
import { cs } from '../../../webparts/covidAdmin/services/covid.service';
import { ICovidCardAdaptiveCardExtensionProps, ICovidCardAdaptiveCardExtensionState, QUICK_VIEW_REGISTRY_ID } from '../CovidCardAdaptiveCardExtension';

export class CardView extends BasePrimaryTextCardView<ICovidCardAdaptiveCardExtensionProps, ICovidCardAdaptiveCardExtensionState> {
  public get cardButtons(): [ICardButton] | [ICardButton, ICardButton] | undefined {
    const register: ICardButton = {
      title: strings.QuickViewButton,
      action: {
        type: 'QuickView',
        parameters: {
          view: QUICK_VIEW_REGISTRY_ID
        }
      }
    };
    return (this.state.canCheckIn && cs.Questions?.length > 0 && cs.Locations?.length > 0) ? [register] : undefined;
  }

  public get data(): IPrimaryTextCardParameters {
    let description: string = "";
    if (this.state.canCheckIn && cs.Questions?.length > 0 && cs.Locations?.length > 0) {
      description = strings.CanCheckIn;
    } else {
      description = this.state.canCheckIn ? strings.NotConfigured : strings.AlreadyCheckedIn;
    }
    return {
      title: strings.PrimaryText,
      primaryText: strings.PrimaryText,
      description: description
    };
  }

  public get onCardSelection(): IQuickViewCardAction | IExternalLinkCardAction | undefined {
    const action: IExternalLinkCardAction = {
      type: 'ExternalLink',
      parameters: {
        isTeamsDeepLink: true,
        target: 'https://teams.microsoft.com/l/entity/3ab8fb75-8f80-4ff1-90a3-6f711ad27c1d/0'
      }
    };
    return action;
  }
}
