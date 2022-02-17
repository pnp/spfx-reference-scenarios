import {
  BasePrimaryTextCardView,
  IPrimaryTextCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction,
  ICardButton
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'TeamcalendarAdaptiveCardExtensionStrings';
import { ITeamcalendarAdaptiveCardExtensionProps, ITeamcalendarAdaptiveCardExtensionState, QUICK_VIEW_REGISTRY_ID } from '../TeamcalendarAdaptiveCardExtension';

export class CardView extends BasePrimaryTextCardView<ITeamcalendarAdaptiveCardExtensionProps, ITeamcalendarAdaptiveCardExtensionState> {
  public get data(): IPrimaryTextCardParameters {
    return {
      primaryText: strings.CardViewTitle,
      description: strings.CardViewText
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
