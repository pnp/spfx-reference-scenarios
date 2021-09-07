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
  
  export class ChannelLinkErrorCardView extends BasePrimaryTextCardView<ITeamsChatAdaptiveCardExtensionProps, ITeamsChatAdaptiveCardExtensionState> {
  
    public get data(): IPrimaryTextCardParameters {
      return {
        primaryText: "Error",
        description: "Could not parse the channel link in settings"
      };
    }
  }
  