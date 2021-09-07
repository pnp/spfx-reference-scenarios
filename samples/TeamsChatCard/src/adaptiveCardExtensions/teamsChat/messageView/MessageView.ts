import { ItemBody } from '@microsoft/microsoft-graph-types';
import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments, ISubmitActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'TeamsChatAdaptiveCardExtensionStrings';
import { ITeamsChatAdaptiveCardExtensionProps, ITeamsChatAdaptiveCardExtensionState, MESSAGE_REGISTRY_ID } from '../TeamsChatAdaptiveCardExtension';
import { PickedChatMessage } from "../types";
import { addMessageReply, getMessageReplies } from "../messages";

export class MessageView extends BaseAdaptiveCardView<ITeamsChatAdaptiveCardExtensionProps, ITeamsChatAdaptiveCardExtensionState, PickedChatMessage> {

  private _pollingStarted = false;
  private _pollingCancel;

  public get data(): PickedChatMessage {

    if (this.state.selectedMessage < 0 || this.state.selectedMessage > this.state.messages.length) {
      return {
        subject: `Invalid card selection (${this.state.selectedMessage})`,
      };
    }

    const { messages } = this.state;

    const selectedMessage = messages[this.state.selectedMessage];

    if (!this._pollingStarted) {

      this._pollingStarted = true;

      // this will continuously poll for replies
      this._pollingCancel = getMessageReplies(selectedMessage.id, (replies) => {

        selectedMessage.replies = replies;

        messages[this.state.selectedMessage] = selectedMessage;

        this.setState({
          messages,
        });

      }, 30000);
    }

    return selectedMessage;
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/MessageViewTemplate.json');
  }

  public onAction(action: IActionArguments): void {

    if (action.id === "close") {

      this._pollingStarted = false;
      this._pollingCancel();

      this.setState({
        selectedMessage: -1,
      });

      this.quickViewNavigator.pop();

    } else if (action.id === "reply") {

      setTimeout(async () => {

        const { messages } = this.state;

        const selectedMessage = messages[this.state.selectedMessage];

        const res = await addMessageReply(selectedMessage.id, (<ISubmitActionArguments>action).data.replyText);

        if (res !== null) {

          selectedMessage.replies = [...selectedMessage.replies, res];

          messages[this.state.selectedMessage] = selectedMessage;

          this.setState({
            messages,
          });
        }

      }, 0);
    }
  }
}