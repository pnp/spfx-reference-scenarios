import { ISPFxAdaptiveCard, BaseAdaptiveCardView } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'ListOrdersAdaptiveCardExtensionStrings';
import { IListOrdersAdaptiveCardExtensionProps, IListOrdersAdaptiveCardExtensionState } from '../ListOrdersAdaptiveCardExtension';
import { Order } from '../../../services/Order';

export interface IListOrdersQuickViewData {
  title: string;
  subTitle: string;
  orders: Order[];
}

export class ListOrdersQuickView extends BaseAdaptiveCardView<
  IListOrdersAdaptiveCardExtensionProps,
  IListOrdersAdaptiveCardExtensionState,
  IListOrdersQuickViewData
> {
  public get data(): IListOrdersQuickViewData {
    return {
      title: strings.QuickViewTitle,
      subTitle: strings.QuickViewSubTitle,
      orders: this.state.orders
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/ListOrdersQuickViewTemplate.json');
  }
}