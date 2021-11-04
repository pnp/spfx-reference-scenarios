import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { AddOrderQuickView } from './quickView/AddOrderQuickView';
import { ConfirmQuickView } from './quickView/ConfirmQuickView';
import { ErrorQuickView } from './quickView/ErrorQuickView';
import { ListOrdersQuickView } from './quickView/ListOrdersQuickView';

import { ManageOrdersPropertyPane } from './ManageOrdersPropertyPane';
import * as strings from 'ManageOrdersAdaptiveCardExtensionStrings';
import { DisplayMode } from '@microsoft/sp-core-library';
import { AadHttpClient } from '@microsoft/sp-http';

// Import types to work with OrdersService
import { Order } from '../../services/Order';
import { OrdersService } from '../../services/OrdersService';

export interface IManageOrdersAdaptiveCardExtensionProps {
  title: string;
  iconProperty: string;
  serviceBaseUrl: string;
  loadOrders(): Promise<void>;
  addOrder(order: Order): Promise<Order>;
  updateOrder(order: Order): Promise<Order>;
  deleteOrder(id: string): Promise<void>;
}

export interface IManageOrdersAdaptiveCardExtensionState {
  description: string;
  error?: string;
  orders?: Order[];
}

const CARD_VIEW_REGISTRY_ID: string = 'ManageOrders_CARD_VIEW';
export const LISTORDERS_QUICK_VIEW_REGISTRY_ID: string = 'ListOrders_QUICK_VIEW';
export const ADDORDER_QUICK_VIEW_REGISTRY_ID: string = 'AddOrder_QUICK_VIEW';
export const CONFIRM_QUICK_VIEW_REGISTRY_ID: string = 'Confirm_QUICK_VIEW';
export const ERROR_QUICK_VIEW_REGISTRY_ID: string = 'Error_QUICK_VIEW';

export default class ManageOrdersAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IManageOrdersAdaptiveCardExtensionProps,
  IManageOrdersAdaptiveCardExtensionState
> {
  private _deferredPropertyPane: ManageOrdersPropertyPane | undefined;
  private aadClient: AadHttpClient;

  public async onInit(): Promise<void> {
    this.state = {
      description: strings.LoadingMessage
    };

    this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
    this.quickViewNavigator.register(LISTORDERS_QUICK_VIEW_REGISTRY_ID, () => new ListOrdersQuickView());
    this.quickViewNavigator.register(ADDORDER_QUICK_VIEW_REGISTRY_ID, () => new AddOrderQuickView());
    this.quickViewNavigator.register(CONFIRM_QUICK_VIEW_REGISTRY_ID, () => new ConfirmQuickView());
    this.quickViewNavigator.register(ERROR_QUICK_VIEW_REGISTRY_ID, () => new ErrorQuickView());

    // Create the AadHttpClient instance for the back-end API via aadHttpClientFactory
    this.aadClient = await this.context.aadHttpClientFactory.getClient("api://pnp.contoso.orders");

    this.properties.loadOrders = this.loadOrders;
    this.properties.addOrder = this.addOrder;
    this.properties.updateOrder = this.updateOrder;
    this.properties.deleteOrder = this.deleteOrder;

    setTimeout(this.loadOrders, 500);

    return Promise.resolve();
  }

  private loadOrders = async () => {

    // Skip in case we are missing settings
    if (this.properties.serviceBaseUrl === undefined || this.properties.serviceBaseUrl.length == 0)
    {
      this.setState({
        description: strings.ConfigureMessage,
        orders: []
      });
      if (this.displayMode == DisplayMode.Edit) {
        this.context.propertyPane.open();
      }
    }
    else
    {
      try {

        // Create an instance of the OrderService
        const ordersService = new OrdersService(this.aadClient, this.properties.serviceBaseUrl);

        // Use it to get the list of orders
        const orders = await ordersService.GetOrders();

        this.setState({
          description: `There are ${orders.length} orders in the system`,
          orders: orders
        });
        
      } catch (error) {

        this.setState({
          description: error.message,
          error: error.message,
          orders: []
        });

        console.log(error);
      }
    }
  }

  private addOrder = async (order: Order): Promise<Order> => {

    // Skip in case we are missing settings
    if (this.properties.serviceBaseUrl === undefined || this.properties.serviceBaseUrl.length == 0)
    {
      this.setState({
        description: strings.ConfigureMessage,
        orders: []
      });
      if (this.displayMode == DisplayMode.Edit) {
        this.context.propertyPane.open();
      }

      return null;
    }
    else
    {
      try {

        // Create an instance of the OrderService
        const ordersService = new OrdersService(this.aadClient, this.properties.serviceBaseUrl);

        // Use it to get the list of orders
        const addedOrder = await ordersService.AddOrder(order);
        const orders = await ordersService.GetOrders();

        this.setState({
          description: `There are ${orders.length} orders in the system`,
          orders: orders
        });

        return addedOrder;

      } catch (error) {

        this.setState({
          description: error.message,
          error: error.message,
          orders: []
        });

        console.log(error);
      }
    }
  }

  private updateOrder = async (order: Order): Promise<Order> => {

    // Skip in case we are missing settings
    if (this.properties.serviceBaseUrl === undefined || this.properties.serviceBaseUrl.length == 0)
    {
      this.setState({
        description: strings.ConfigureMessage,
        orders: []
      });
      if (this.displayMode == DisplayMode.Edit) {
        this.context.propertyPane.open();
      }

      return null;
    }
    else
    {
      try {

        // Create an instance of the OrderService
        const ordersService = new OrdersService(this.aadClient, this.properties.serviceBaseUrl);

        // Use it to get the list of orders
        const updatedOrder = await ordersService.UpdateOrder(order);
        const orders = await ordersService.GetOrders();

        this.setState({
          description: `There are ${orders.length} orders in the system`,
          orders: orders
        });

        return updatedOrder;

      } catch (error) {

        this.setState({
          description: error.message,
          error: error.message,
          orders: []
        });

        console.log(error);
      }
    }
  }

  private deleteOrder = async (id: string): Promise<void> => {

    // Skip in case we are missing settings
    if (this.properties.serviceBaseUrl === undefined || this.properties.serviceBaseUrl.length == 0)
    {
      this.setState({
        description: strings.ConfigureMessage,
        orders: []
      });
      if (this.displayMode == DisplayMode.Edit) {
        this.context.propertyPane.open();
      }
    }
    else
    {
      try {

        // Create an instance of the OrderService
        const ordersService = new OrdersService(this.aadClient, this.properties.serviceBaseUrl);

        // Use it to get the list of orders
        await ordersService.DeleteOrder(id);
        const orders = await ordersService.GetOrders();

        this.setState({
          description: `There are ${orders.length} orders in the system`,
          orders: orders
        });

      } catch (error) {

        this.setState({
          description: error.message,
          error: error.message,
          orders: []
        });

        console.log(error);
      }
    }
  }

  public get title(): string {
    return this.properties.title;
  }

  protected get iconProperty(): string {
    return this.properties.iconProperty || require('./assets/SharePointLogo.svg');
  }

  protected loadPropertyPaneResources(): Promise<void> {
    return import(
      /* webpackChunkName: 'ManageOrders-property-pane'*/
      './ManageOrdersPropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.ManageOrdersPropertyPane();
        }
      );
  }

  protected renderCard(): string | undefined {
    return CARD_VIEW_REGISTRY_ID;
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return this._deferredPropertyPane!.getPropertyPaneConfiguration();
  }

  protected async onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): Promise<void> {
    if (propertyPath == 'serviceBaseUrl') {
      await this.loadOrders();
    }
  }
}
