import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { ListOrdersQuickView } from './quickView/ListOrdersQuickView';
import { ListOrdersPropertyPane } from './ListOrdersPropertyPane';
import * as strings from 'ListOrdersAdaptiveCardExtensionStrings';
import { DisplayMode } from '@microsoft/sp-core-library';
import { AadHttpClient } from '@microsoft/sp-http';

// Import types to work with OrdersService
import { Order } from '../../services/Order';
import { OrdersService } from '../../services/OrdersService';

export interface IListOrdersAdaptiveCardExtensionProps {
  title: string;
  iconProperty: string;
  serviceBaseUrl: string;
}

export interface IListOrdersAdaptiveCardExtensionState {
  description: string;
  orders?: Order[];
}

const CARD_VIEW_REGISTRY_ID: string = 'ListOrders_CARD_VIEW';
export const LISTORDERS_QUICK_VIEW_REGISTRY_ID: string = 'ListOrders_QUICK_VIEW';

export default class ListOrdersAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IListOrdersAdaptiveCardExtensionProps,
  IListOrdersAdaptiveCardExtensionState
> {
  private _deferredPropertyPane: ListOrdersPropertyPane | undefined;
  private aadClient: AadHttpClient;

  public async onInit(): Promise<void> {
    this.state = {
      description: strings.LoadingMessage
    };

    this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
    this.quickViewNavigator.register(LISTORDERS_QUICK_VIEW_REGISTRY_ID, () => new ListOrdersQuickView());

    // Create the AadHttpClient instance for the back-end API via aadHttpClientFactory
    this.aadClient = await this.context.aadHttpClientFactory.getClient("api://pnp.contoso.orders");

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
      /* webpackChunkName: 'ListOrders-property-pane'*/
      './ListOrdersPropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.ListOrdersPropertyPane();
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
