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
    const action: IExternalLinkCardAction = {
      type: 'ExternalLink',
      parameters: {
        isTeamsDeepLink: true,
        target: 'https://teams.microsoft.com/l/entity/3ab8fb75-8f80-4ff1-90a3-6f711ad27c1d/0'
      }
    };
    return (this.state.canCheckIn) ? action : undefined;
  }
}
