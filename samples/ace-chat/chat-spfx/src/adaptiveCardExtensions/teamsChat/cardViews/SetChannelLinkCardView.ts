import {
  BasePrimaryTextCardView,
  IPrimaryTextCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction,
  ICardButton
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'TeamsChatAdaptiveCardExtensionStrings';
import {
  ITeamsChatAdaptiveCardExtensionProps,
  ITeamsChatAdaptiveCardExtensionState,
} from '../TeamsChatAdaptiveCardExtension';

export class SetChannelLinkCardView extends BasePrimaryTextCardView<ITeamsChatAdaptiveCardExtensionProps, ITeamsChatAdaptiveCardExtensionState> {

  public get data(): IPrimaryTextCardParameters {
    return {
      primaryText: "Setup Required",
      description: "You must set a channel link to connect to the channel"
    };
  }
}
