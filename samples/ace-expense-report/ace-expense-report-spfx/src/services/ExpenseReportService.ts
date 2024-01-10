import { ExpenseReport } from "../models/ExpenseReport";
import { IExpenseReportService } from "./IExpenseReportService";

// Import types for supporting SPFx with the service class
import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { AadHttpClientFactory, AadHttpClient, IHttpClientOptions } from "@microsoft/sp-http";

export class ExpenseReportService implements IExpenseReportService {

    public static readonly serviceKey: ServiceKey<IExpenseReportService> = ServiceKey.create<IExpenseReportService>('PnP:ExpenseReportService', ExpenseReportService);
    private _serviceClient: AadHttpClient;
    private _serviceBaseUrl: string;

        /**
     * Constructor for the service class
     * @param serviceScope Service Scope to initialize the service class
     */
    public constructor(serviceScope: ServiceScope) {

        // Initialize the service instance clients
        serviceScope.whenFinished(async () => {
            const aadHttpClientFactory = serviceScope.consume(AadHttpClientFactory.serviceKey);
            this._serviceClient = await aadHttpClientFactory.getClient('api://pnp.expensereport.service');
        });
    }

    public setServiceBaseUrl(serviceBaseUrl: string): void {
        this._serviceBaseUrl = serviceBaseUrl;
    }

    public async createExpenseReport(expenseReport: ExpenseReport): Promise<void> {

        // Buil the actual service endpoint URL
        const serviceEndpointUrl: string = `${this._serviceBaseUrl}api/UploadExpenseReport`;

        // Invoke the target service endpoint
        try {
            const requestHeaders: Headers = new Headers();
            requestHeaders.append('Content-type', 'application/json');

            const requestMessage: IHttpClientOptions = {
                body: JSON.stringify(expenseReport),
                headers: requestHeaders
            }

            await this._serviceClient.post(
                serviceEndpointUrl, 
                AadHttpClient.configurations.v1,
                requestMessage);  
        }
        catch (ex) {
            console.log(ex);
        }
    }
}