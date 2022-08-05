import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';

import { SimplelistPropertyPane } from './SimplelistPropertyPane';
import { SimpleList } from '../../common/models/designtemplate.models';
import { dtg } from '../../common/services/designtemplate.service';

export interface ISimplelistAdaptiveCardExtensionProps {
  iconProperty: string;
  title: string;
}

export interface ISimplelistAdaptiveCardExtensionState {
  app: SimpleList;
}

const CARD_VIEW_REGISTRY_ID = 'Simplelist_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID = 'Simplelist_QUICK_VIEW';

export default class SimplelistAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  ISimplelistAdaptiveCardExtensionProps,
  ISimplelistAdaptiveCardExtensionState
> {

  private LOG_SOURCE = "🔶 Simple List Adaptive Card Extension";
  private _deferredPropertyPane: SimplelistPropertyPane | undefined;

  public async onInit(): Promise<void> {
    try {
      //Initialize Service
      await dtg.Init(this.context.serviceScope);

      //Get the data for the app
      const app: SimpleList = dtg.GetSimpleList(this.context.pageContext.cultureInfo.currentUICultureName);

      //Set the data into state
      this.state = {
        app: app
      };
      //Register the cards
      this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
      this.quickViewNavigator.register(QUICK_VIEW_REGISTRY_ID, () => new QuickView());
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (onInit) -- Could not initialize web part. - ${err}`
      );
    }
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
      /* webpackChunkName: 'Simplelist-property-pane'*/
      './SimplelistPropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.SimplelistPropertyPane();
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
