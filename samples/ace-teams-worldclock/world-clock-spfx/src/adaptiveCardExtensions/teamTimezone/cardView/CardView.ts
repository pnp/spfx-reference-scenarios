import {
  IExternalLinkCardAction,
  IQuickViewCardAction,
  ICardButton,
  BaseBasicCardView,
  IBasicCardParameters
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'TeamTimezoneAdaptiveCardExtensionStrings';
import { iconBW } from '../assets/images';
import { ITeamTimezoneAdaptiveCardExtensionProps, ITeamTimezoneAdaptiveCardExtensionState, QUICK_VIEW_REGISTRY_ID } from '../TeamTimezoneAdaptiveCardExtension';

export class CardView extends BaseBasicCardView<ITeamTimezoneAdaptiveCardExtensionProps, ITeamTimezoneAdaptiveCardExtensionState> {
  public get cardButtons(): [ICardButton] | [ICardButton, ICardButton] | undefined {
    return [
      {
        title: strings.QuickViewButton,
        action: {
          type: 'QuickView',
          parameters: {
            view: QUICK_VIEW_REGISTRY_ID
          }
        }
      }
    ];
  }

  public get data(): IBasicCardParameters {
    return {
      title: strings.PrimaryText,
      iconProperty: iconBW,
      primaryText: strings.CardDescription
    };
  }

  public get onCardSelection(): IQuickViewCardAction | IExternalLinkCardAction | undefined {
    return {
      type: 'ExternalLink',
      parameters: {
        target: this.state.teamsUrl
      }
    };
  }
}
