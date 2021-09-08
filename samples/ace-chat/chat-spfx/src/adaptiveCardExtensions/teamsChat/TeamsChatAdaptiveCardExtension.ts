import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { SetChannelLinkCardView, DefaultCardView, ChannelLinkErrorCardView } from './cardViews/index';
import { MessageListView } from "./messageListView/MessageListView";
import { MessageView } from "./messageView/MessageView";
import { TeamsChatPropertyPane } from './TeamsChatPropertyPane';
import { stringIsNullOrEmpty } from "@pnp/common";
import { PickedChatMessage } from "./types";
import { initMessages, getMessageReader } from "./messages";

export interface ITeamsChatAdaptiveCardExtensionProps {
  title: string;
  description: string;
  iconProperty: string;
  channelLink: string;
}

export interface ITeamsChatAdaptiveCardExtensionState {
  channelBaseUrl: string;
  messages: PickedChatMessage[];
  selectedMessage: number;
  cardViewToRender: string;
}

// constants to name our cards
const CHANNELLINKERROR_REGISTRY_ID: string = 'ChannelLinkError_CARD_VIEW';
const SET_CHANNELLINK_REGISTRY_ID: string = 'MustSetChannelLink_CARD_VIEW';
const CARD_VIEW_REGISTRY_ID: string = 'TeamsChat_CARD_VIEW';
export const MESSAGE_LIST_REGISTRY_ID = "TeamsChat_MESSAGE_LIST_VIEW";
export const MESSAGE_REGISTRY_ID = "TeamsChat_MESSAGE_VIEW";

export default class TeamsChatAdaptiveCardExtension extends BaseAdaptiveCardExtension<ITeamsChatAdaptiveCardExtensionProps, ITeamsChatAdaptiveCardExtensionState> {

  private _deferredPropertyPane: TeamsChatPropertyPane | undefined;

  public async onInit(): Promise<void> {

    this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new DefaultCardView());
    this.cardNavigator.register(SET_CHANNELLINK_REGISTRY_ID, () => new SetChannelLinkCardView());
    this.cardNavigator.register(CHANNELLINKERROR_REGISTRY_ID, () => new ChannelLinkErrorCardView());

    this.quickViewNavigator.register(MESSAGE_LIST_REGISTRY_ID, () => new MessageListView());
    this.quickViewNavigator.register(MESSAGE_REGISTRY_ID, () => new MessageView());

    this.state = {
      cardViewToRender: CARD_VIEW_REGISTRY_ID,
      channelBaseUrl: null,
      messages: null,
      selectedMessage: -1,
    };

    this.setupViews();
  }

  public get title(): string {

    return this.properties.title;
  }

  protected get iconProperty(): string {

    return this.properties.iconProperty || require('./assets/SharePointLogo.svg');
  }

  protected async loadPropertyPaneResources(): Promise<void> {

    const component = await import(
      /* webpackChunkName: 'TeamsChat-property-pane'*/
      './TeamsChatPropertyPane'
    );

    this._deferredPropertyPane = new component.TeamsChatPropertyPane();
  }

  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {

    if (propertyPath === "channelLink" && oldValue !== newValue) {
      this.setupViews();
    }
  }

  protected renderCard(): string | undefined {

    // update via code, but state used to ensure on refresh we show the correct view
    return this.state.cardViewToRender;
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {

    return this._deferredPropertyPane!.getPropertyPaneConfiguration();
  }

  private async setupViews(): Promise<void> {

    // if no link we need to reset our card
    if (stringIsNullOrEmpty(this.properties.channelLink)) {
      this.setState({
        cardViewToRender: SET_CHANNELLINK_REGISTRY_ID
      });
      // update the displayed card
      this.cardNavigator.replace(this.state.cardViewToRender);
      return;
    }

    // we need to pick out the pieces we need for the graph api from the "link to channel" url
    const matches = /^https:\/\/.*?\/channel\/(.*?)\/.*?groupId=([a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9-]{12})/i.exec(this.properties.channelLink);

    // we expect exactly three matches, anything else and we just don't know
    if (matches === null || matches.length !== 3) {
      this.setState({
        cardViewToRender: CHANNELLINKERROR_REGISTRY_ID,
      });
      this.cardNavigator.replace(this.state.cardViewToRender);
      return;
    }

    // update the state
    this.setState({
      channelBaseUrl: `/teams/${matches[2]}/channels/${matches[1]}`,
      messages: [],
      selectedMessage: -1,
      cardViewToRender: CARD_VIEW_REGISTRY_ID,
    });

    // update the displayed card
    this.cardNavigator.replace(this.state.cardViewToRender);

    // now we setup our message reader
    const client = await this.context.msGraphClientFactory.getClient();

    // we need to initialize the messages module
    initMessages(client, this.state.channelBaseUrl);

    // create a new reader
    const reader = getMessageReader(4, 15000);

    // here we will continually check for new messages and update the state
    // we only need to do this once, and if this is called we will have at
    // least one new message
    reader((messages) => {

      this.setState({
        messages: [...this.state.messages, ...messages],
      });

    });
  }
}
