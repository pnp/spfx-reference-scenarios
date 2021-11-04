import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'ManageOrdersAdaptiveCardExtensionStrings';
import { 
  IManageOrdersAdaptiveCardExtensionProps, 
  IManageOrdersAdaptiveCardExtensionState, 
  CONFIRM_QUICK_VIEW_REGISTRY_ID,
  ERROR_QUICK_VIEW_REGISTRY_ID
} from '../ManageOrdersAdaptiveCardExtension';
import { Order } from '../../../services/Order';

export interface IAddOrderQuickViewData {
  orderIdPlaceholder: string;
  customerIdPlaceholder: string;
}

export class AddOrderQuickView extends BaseAdaptiveCardView<
  IManageOrdersAdaptiveCardExtensionProps,
  IManageOrdersAdaptiveCardExtensionState,
  IAddOrderQuickViewData
> {
  public get data(): IAddOrderQuickViewData {
    return {
      orderIdPlaceholder: strings.OrderIdPlaceholder,
      customerIdPlaceholder: strings.CustomerIdPlaceholder
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/AddOrderQuickViewTemplate.json');
  }

  public onAction(action: IActionArguments | any): void {

    // Prepare the new order instance
    const order: Order = {
      id: action.data.id,
      customerId: action.data.customerId,
      date: action.data.date,
      status: action.data.status,
      items: null
    };
  
    const newOrder = this.properties.addOrder(order);
    
    if (newOrder === undefined) {
      this.quickViewNavigator.replace(ERROR_QUICK_VIEW_REGISTRY_ID);
    } else {
      this.quickViewNavigator.replace(CONFIRM_QUICK_VIEW_REGISTRY_ID);
    }

  }
}