import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'ManageOrdersAdaptiveCardExtensionStrings';
import { IManageOrdersAdaptiveCardExtensionProps, IManageOrdersAdaptiveCardExtensionState } from '../ManageOrdersAdaptiveCardExtension';
import { Order } from '../../../services/Order';

export interface IListOrdersQuickViewData {
  subTitle: string;
  title: string;
  orders: Order[];
  imageUpUrl: string;
  imageDownUrl: string;
}

export class ListOrdersQuickView extends BaseAdaptiveCardView<
  IManageOrdersAdaptiveCardExtensionProps,
  IManageOrdersAdaptiveCardExtensionState,
  IListOrdersQuickViewData
> {
  public get data(): IListOrdersQuickViewData {
    return {
      subTitle: strings.SubTitle,
      title: strings.Title,
      orders: this.state.orders,
      imageUpUrl:  require('../assets/up.png'),
      imageDownUrl:  require('../assets/down.png')
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/ListOrdersQuickViewTemplate.json');
  }

  public onAction(action: IActionArguments | any): void {

    // Get the ID of the button pressed by the user
    const actionId = <string>action.id;

    // Check if the actionId is the one of an update Action.Submit button
    if (actionId.substring(0, 6) == "update") {

      // Determine the order to update, by id
      const ordersById = this.state.orders.filter(o => o.id == action.data.id);

      // If we've found the target order
      if (ordersById != undefined && ordersById.length > 0) {
        // Update the status accordingly to the new value we've got
        ordersById[0].status = action.data[`changeStatus${action.data.itemIndex}`];
        // and update the order
        this.properties.updateOrder(ordersById[0]);
      }
    }
    // Otherwise check if it is a request to delete the current order item
    // Check if the actionId is the one of an update Action.Submit button
    else if (actionId.substring(0, 6) == "delete") {
        // and delete the order
        this.properties.deleteOrder(action.data.id);
    }
  }
}