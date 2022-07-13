import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { InventorydetailsPropertyPane } from './InventorydetailsPropertyPane';

import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";

import { dtg } from '../../common/services/designtemplate.service';
import { InventoryDetail } from '../../common/models/designtemplate.models';
import * as strings from 'InventorydetailsAdaptiveCardExtensionStrings';

export interface IInventorydetailsAdaptiveCardExtensionProps {
  distributionCenterNumber: string;
  iconProperty: string;
  title: string;
}

export interface IInventorydetailsAdaptiveCardExtensionState {
  app: InventoryDetail;
}

const CARD_VIEW_REGISTRY_ID: string = 'Inventorydetails_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'Inventorydetails_QUICK_VIEW';

export default class InventorydetailsAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IInventorydetailsAdaptiveCardExtensionProps,
  IInventorydetailsAdaptiveCardExtensionState
> {
  private LOG_SOURCE: string = "🔶 Inventory Details Adaptive Card Extension";
  private _deferredPropertyPane: InventorydetailsPropertyPane | undefined;

  public onInit(): Promise<void> {
    try {
      //Initialize PnPLogger
      Logger.subscribe(new ConsoleListener());
      Logger.activeLogLevel = LogLevel.Info;

      //Initialize Service
      dtg.Init();

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
      Logger.write(`${this.LOG_SOURCE} (onInit) - ${err}`, LogLevel.Error);
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
