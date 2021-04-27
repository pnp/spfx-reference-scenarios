import {
  BasePrimaryTextCardView,
  IPrimaryTextCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction,
  ICardButton
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'CovidCardAdaptiveCardExtensionStrings';
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
    return (this.state.canCheckIn) ? [register] : undefined;
  }

  public get data(): IPrimaryTextCardParameters {
    return {
      primaryText: strings.PrimaryText,
      description: this.state.canCheckIn ? strings.CanCheckIn : strings.AlreadyCheckedIn
    };
  }

  public get onCardSelection(): IQuickViewCardAction | IExternalLinkCardAction | undefined {
    return {
      type: 'ExternalLink',
      parameters: {
        isTeamsDeepLink: true,
        target: 'https://teams.microsoft.com/l/entity/b4428e10-5ce4-4583-bfd0-cbc454896ac1/0'
      }
    };
  }
}
