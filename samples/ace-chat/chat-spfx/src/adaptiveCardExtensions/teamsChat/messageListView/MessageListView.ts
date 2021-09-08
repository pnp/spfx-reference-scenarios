import { ItemBody } from '@microsoft/microsoft-graph-types';
import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments, ISubmitAction, ISubmitActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'TeamsChatAdaptiveCardExtensionStrings';
import { ITeamsChatAdaptiveCardExtensionProps, ITeamsChatAdaptiveCardExtensionState, MESSAGE_REGISTRY_ID } from '../TeamsChatAdaptiveCardExtension';
import { PickedChatMessage } from "../types";
import { getMessageReplies } from "../messages";

interface MessageListViewData {
  messages: PickedChatMessage[];
}

export class MessageListView extends BaseAdaptiveCardView<ITeamsChatAdaptiveCardExtensionProps, ITeamsChatAdaptiveCardExtensionState, MessageListViewData> {

  public get data(): MessageListViewData {

    const { messages } = this.state;
    return { messages };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/MessageListViewTemplate.json');
  }

  public onAction(action: IActionArguments): void {

    this.setState({
      selectedMessage: (<ISubmitActionArguments>action).data.index
    });

    this.quickViewNavigator.push(MESSAGE_REGISTRY_ID);
  }
}
