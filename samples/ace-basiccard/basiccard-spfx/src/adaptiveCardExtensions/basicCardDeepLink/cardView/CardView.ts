import {
  BaseBasicCardView,
  IBasicCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction,
} from '@microsoft/sp-adaptive-card-extension-base';
import { IBasicCardDeepLinkAdaptiveCardExtensionProps } from '../BasicCardDeepLinkAdaptiveCardExtension';

export class CardView extends BaseBasicCardView<IBasicCardDeepLinkAdaptiveCardExtensionProps, {}> {

  public get data(): IBasicCardParameters {
    return {
      primaryText: this.properties.description,
      title: this.properties.title,
    };
  }

  public get onCardSelection(): IQuickViewCardAction | IExternalLinkCardAction | undefined {

    // can have simple defaults
    const url = this.properties.linkUrl ?? "https://bing.com";

    // return the external link details, defined by properties
    return {
      type: 'ExternalLink',
      parameters: {
        isTeamsDeepLink: this.properties.teamsLink,
        target: url
      }
    };
  }
}
