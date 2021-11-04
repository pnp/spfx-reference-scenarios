import { Order } from './Order';
import { AadHttpClient, IHttpClientOptions } from '@microsoft/sp-http';
import * as strings from 'OrderServiceStrings';


/**
 * Define a custom Error type for the Orders Service
 */
 export class OrderServiceError extends Error {
    constructor(message: string) {
        super(message);
    }
}

/**
 * Defines the abstract interface for the Orders Service
 */
export interface IOrdersService {

    /**
     * Returns the whole list of orders
     * @returns The whole list of orders
     */
    GetOrders: () => Promise<Order[]>;

    /**
     * Retrieves a specific order by ID
     * @param id The ID of the order to retrieve
     * @returns A specific order by ID
     */
    GetOrder: (id: string) => Promise<Order>;

    /**
     * Adds a new order
     * @param order The order to add
     * @returns The just inserted order
     */
    AddOrder: (order: Order) => Promise<Order>;

    /**
     * Updates an already existing order
     * @param order The updated order to save
     * @returns The just updated order
     */
    UpdateOrder: (order: Order) => Promise<Order>;

    /**
     * Deletes a specific order by ID
     * @param id The ID of the order to delete
     */
    DeleteOrder: (id: string) => Promise<void>;
}

export class OrdersService implements IOrdersService {

    private serviceBaseUrl: string;
    private aadClient: AadHttpClient;

    constructor(aadClient: AadHttpClient, serviceBaseUrl: string) {
        if (aadClient === undefined) {
            throw new Error(strings.ErrorNullArgument + 'aadClient');
        }

        if (serviceBaseUrl === undefined) {
            throw new Error(strings.ErrorNullArgument + 'serviceBaseUrl');
        }

        this.aadClient = aadClient;
        this.serviceBaseUrl = serviceBaseUrl.replace(/\/$/, "");
    }

    /**
     * Returns the whole list of orders
     * @returns The whole list of orders
     */
    public async GetOrders(): Promise<Order[]> {

        try {
            // Make the actual HTTP request
            const httpResponse = await this.aadClient.get(
                `${this.serviceBaseUrl}/api/orders`, 
                AadHttpClient.configurations.v1);

            if (httpResponse.status === 403) {
                throw new OrderServiceError(strings.ErrorForbidden);
            }
            else if (httpResponse.status !== 200) {
                throw new OrderServiceError(strings.ErrorRetrievingOrders);
            }
        
            // Parse the JSON response
            const result: Order[] = await httpResponse.json();

            // Return the orders
            return result;
        } catch (error) {
            if (error instanceof OrderServiceError) {
                throw error;
            } else {
                throw new OrderServiceError(`${strings.ErrorRetrievingOrders}: ${error.message}`);
            }
        }
    }

     /**
      * Retrieves a specific order by ID
      * @param id The ID of the order to retrieve
      * @returns A specific order by ID
      */
    public async GetOrder(id: string): Promise<Order> {

        try {
            // Make the actual HTTP request
            const httpResponse = await this.aadClient.get(
                `${this.serviceBaseUrl}/api/orders/${id}`, 
                AadHttpClient.configurations.v1);

            if (httpResponse.status === 403) {
                throw new OrderServiceError(strings.ErrorForbidden);
            }
            else if (httpResponse.status !== 200) {
                throw new OrderServiceError(strings.ErrorRetrievingOrder);
            }
        
            // Parse the JSON response
            const result: Order = await httpResponse.json();

            // Return the single order
            return result;
        } catch (error) {
            if (error instanceof OrderServiceError) {
                throw error;
            } else {
                throw new OrderServiceError(`${strings.ErrorRetrievingOrder}: ${error.message}`);
            }
        }
    }
 
     /**
      * Adds a new order
      * @param order The order to add
      * @returns The just inserted order
      */
    public async AddOrder(order: Order): Promise<Order> {

        try {
            // Define the HTTP request headers
            const requestHeaders: Headers = new Headers();
            requestHeaders.append('Content-type', 'application/json');

            // Configure the request options
            const httpOptions: IHttpClientOptions = {
                body: JSON.stringify(order),
                headers: requestHeaders
            };

            // Make the actual HTTP request
            const httpResponse = await this.aadClient.post(
                `${this.serviceBaseUrl}/api/orders`, 
                AadHttpClient.configurations.v1,
                httpOptions);

            if (httpResponse.status === 403) {
                throw new OrderServiceError(strings.ErrorForbidden);
            }
            else if (httpResponse.status !== 200) {
                throw new OrderServiceError(strings.ErrorAddingOrder);
            }

            // Parse the JSON response
            const result: Order = await httpResponse.json();

            // Return the single order
            return result;
        } catch (error) {
            if (error instanceof OrderServiceError) {
                throw error;
            } else {
                throw new OrderServiceError(`${strings.ErrorAddingOrder}: ${error.message}`);
            }
        }
    }
 
     /**
      * Updates an already existing order
      * @param order The updated order to save
      * @returns The just updated order
      */
    public async UpdateOrder(order: Order): Promise<Order> {

        try {
            // Define the HTTP request headers
            const requestHeaders: Headers = new Headers();
            requestHeaders.append('Content-type', 'application/json');

            // Configure the request options
            const httpOptions: IHttpClientOptions = {
                method: "PUT",
                body: JSON.stringify(order),
                headers: requestHeaders
            };

            // Make the actual HTTP request
            const httpResponse = await this.aadClient.fetch(
                `${this.serviceBaseUrl}/api/orders/${order.id}`, 
                AadHttpClient.configurations.v1,
                httpOptions);

            if (httpResponse.status === 403) {
                throw new OrderServiceError(strings.ErrorForbidden);
            }
            else if (httpResponse.status !== 200) {
                throw new OrderServiceError(strings.ErrorUpdatingOrder);
            }

            // Parse the JSON response
            const result: Order = await httpResponse.json();

            // Return the single order
            return result;
        } catch (error) {
            if (error instanceof OrderServiceError) {
                throw error;
            } else {
                throw new OrderServiceError(`${strings.ErrorUpdatingOrder}: ${error.message}`);
            }
        }
    }
 
     /**
      * Deletes a specific order by ID
      * @param id The ID of the order to delete
      */
     public async DeleteOrder(id: string): Promise<void> {

        try {
            // Define the HTTP request headers
            const requestHeaders: Headers = new Headers();
            requestHeaders.append('Content-type', 'application/json');

            // Configure the request options
            const httpOptions: IHttpClientOptions = {
                method: "DELETE",
                headers: requestHeaders
            };

            // Make the actual HTTP request
            const httpResponse = await this.aadClient.fetch(
                `${this.serviceBaseUrl}/api/orders/${id}`, 
                AadHttpClient.configurations.v1,
                httpOptions);

            if (httpResponse.status === 403) {
                throw new OrderServiceError(strings.ErrorForbidden);
            }
            else if (httpResponse.status !== 200) {
                throw new OrderServiceError(strings.ErrorDeletingOrder);
            }
        } catch (error) {
            if (error instanceof OrderServiceError) {
                throw error;
            } else {
                throw new OrderServiceError(`${strings.ErrorDeletingOrder}: ${error.message}`);
            }
        }
     }
}
