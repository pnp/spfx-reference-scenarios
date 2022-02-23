import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'InventorydetailsAdaptiveCardExtensionStrings';

import { Logger, LogLevel } from "@pnp/logging";

import { IInventorydetailsAdaptiveCardExtensionProps, IInventorydetailsAdaptiveCardExtensionState } from '../InventorydetailsAdaptiveCardExtension';
import { InventoryDetail } from '../../../common/models/designtemplate.models';

export interface IQuickViewData {
  app: InventoryDetail;
  centerNumber: string;
  currentTime: string;
  strings: IInventorydetailsAdaptiveCardExtensionStrings;
}

export class QuickView extends BaseAdaptiveCardView<
  IInventorydetailsAdaptiveCardExtensionProps,
  IInventorydetailsAdaptiveCardExtensionState,
  IQuickViewData
> {
  private LOG_SOURCE: string = "🔶 Inventory Quick View";

  public get data(): IQuickViewData {
    let formattedDate: string = new Date().toISOString();
    formattedDate = formattedDate.slice(0, formattedDate.length - 5);
    formattedDate = formattedDate + "Z";
    let distCtrNumber = this.properties.distributionCenterNumber;
    if (distCtrNumber.length <= 0) {
      distCtrNumber = "1";
    }
    return {
      app: this.state.app,
      centerNumber: distCtrNumber,
      currentTime: formattedDate,
      strings: strings
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }
}