import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { InventorydetailsPropertyPane } from './InventorydetailsPropertyPane';

import { InventoryDetail } from '../../common/models/designtemplate.models';
import { dtg } from '../../common/services/designtemplate.service';

export interface IInventorydetailsAdaptiveCardExtensionProps {
  distributionCenterNumber: string;
  iconProperty: string;
  title: string;
}

export interface IInventorydetailsAdaptiveCardExtensionState {
  app: InventoryDetail;
}

const CARD_VIEW_REGISTRY_ID = 'Inventorydetails_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID = 'Inventorydetails_QUICK_VIEW';

export default class InventorydetailsAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IInventorydetailsAdaptiveCardExtensionProps,
  IInventorydetailsAdaptiveCardExtensionState
> {
  private LOG_SOURCE = "🔶 Inventory Details Adaptive Card Extension";
  private _deferredPropertyPane: InventorydetailsPropertyPane | undefined;

  public async onInit(): Promise<void> {
    try {
      //Initialize Service
      await dtg.Init(this.context.serviceScope);

      //Get the data for the app
      const app: InventoryDetail = dtg.GetInventoryDetail();

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
      /* webpackChunkName: 'Inventorydetails-property-pane'*/
      './InventorydetailsPropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.InventorydetailsPropertyPane();
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
