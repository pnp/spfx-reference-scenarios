import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { AceSharedState2PropertyPane } from './AceSharedState2PropertyPane';

import { bindDataLib } from "ace-data-broker";

export interface IAceSharedState2AdaptiveCardExtensionProps {
  title: string;
  description: string;
  iconProperty: string;
}

export interface IAceSharedState2AdaptiveCardExtensionState {
  description: string;
}

const CARD_VIEW_REGISTRY_ID: string = 'AceSharedState2_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'AceSharedState2_QUICK_VIEW';

export default class AceSharedState2AdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IAceSharedState2AdaptiveCardExtensionProps,
  IAceSharedState2AdaptiveCardExtensionState
> {
  private _deferredPropertyPane: AceSharedState2PropertyPane | undefined;

  public onInit(): Promise<void> {

    const lib = bindDataLib(<any>this.context);

    lib.getString();

    this.state = {
      description: `string: ${lib.getString()}`,
    };

    (async () => {

      const items = await lib.getItemsCached("Generic", 30);

      const allItems = await lib.getLotsOfItems("BigList");

      this.setState({
        description: `string: ${lib.getString()}, items.length: ${items.length}, allItems.length: ${allItems.length}`
      });

    })();

    this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
    this.quickViewNavigator.register(QUICK_VIEW_REGISTRY_ID, () => new QuickView());

    return Promise.resolve();
  }

  public get title(): string {
    return this.properties.title;
  }

  protected get iconProperty(): string {
    return this.properties.iconProperty || require('./assets/SharePointLogo.svg');
  }

  protected loadPropertyPaneResources(): Promise<void> {
    return import(
      /* webpackChunkName: 'AceSharedState2-property-pane'*/
      './AceSharedState2PropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.AceSharedState2PropertyPane();
        }
      );
  }

  protected renderCard(): string | undefined {
    return CARD_VIEW_REGISTRY_ID;
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return this._deferredPropertyPane!.getPropertyPaneConfiguration();
  }
}
