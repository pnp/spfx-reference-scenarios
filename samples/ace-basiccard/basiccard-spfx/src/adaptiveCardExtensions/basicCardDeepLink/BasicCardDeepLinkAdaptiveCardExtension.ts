import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { BasicCardDeepLinkPropertyPane } from './BasicCardDeepLinkPropertyPane';

export interface IBasicCardDeepLinkAdaptiveCardExtensionProps {
  title: string;
  description: string;
  linkUrl: string;
  teamsLink: boolean;
}

// In this example we have only a single card view to keep things simple
const CARD_VIEW_REGISTRY_ID: string = 'BasicCardDeepLink_CARD_VIEW';

export default class BasicCardDeepLinkAdaptiveCardExtension extends BaseAdaptiveCardExtension<IBasicCardDeepLinkAdaptiveCardExtensionProps, {}> {

  private _deferredPropertyPane: BasicCardDeepLinkPropertyPane | undefined;

  public async onInit(): Promise<void> {

    // init our state, which will remain empty in this example
    this.state = {};

    // register the single card view
    this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
  }

  public get title(): string {
    return this.properties.title;
  }

  protected get iconProperty(): string {
    return require('./assets/SharePointLogo.svg');
  }

  protected async loadPropertyPaneResources(): Promise<void> {

    const component = await import(
      /* webpackChunkName: 'BasicCardDeepLink-property-pane' */
      './BasicCardDeepLinkPropertyPane'
    );

    this._deferredPropertyPane = new component.BasicCardDeepLinkPropertyPane();
  }

  protected renderCard(): string | undefined {
    return CARD_VIEW_REGISTRY_ID;
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return this._deferredPropertyPane!.getPropertyPaneConfiguration();
  }
}
