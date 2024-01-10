import type { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { HomeCardView } from './cardView/HomeCardView';
import { ConfirmCardView } from './cardView/ConfirmCardView';
import { UploadQuickView } from './quickView/UploadQuickView';
import { ExpenseReportPropertyPane } from './ExpenseReportPropertyPane';
import { IExpenseReportService } from '../../services/IExpenseReportService';
import { ExpenseReportService } from '../../services/ExpenseReportService';
import { ExpenseReport } from '../../models/ExpenseReport';

export interface IExpenseReportAdaptiveCardExtensionProps {
  title: string;
  serviceBaseUrl: string;
  createExpenseReport: (expenseReport: ExpenseReport) => Promise<void>;
}

export interface IExpenseReportAdaptiveCardExtensionState {
  expenseReceiptFileName?: string;
  expenseReceiptContent?: string;
}

export const CARD_VIEW_HOME_REGISTRY_ID: string = 'ExpenseReport_Home_CARD_VIEW';
export const CARD_VIEW_CONFIRM_REGISTRY_ID: string = 'ExpenseReport_Confirm_CARD_VIEW';
export const QUICK_VIEW_UPLOAD_REGISTRY_ID: string = 'ExpenseReport_Upload_QUICK_VIEW';

export default class ExpenseReportAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IExpenseReportAdaptiveCardExtensionProps,
  IExpenseReportAdaptiveCardExtensionState
> {
  private _deferredPropertyPane: ExpenseReportPropertyPane;
  private _expenseReportService: IExpenseReportService

  public onInit(): Promise<void> {
    this.state = { };

    // registers the card view to be shown in a dashboard
    this.cardNavigator.register(CARD_VIEW_HOME_REGISTRY_ID, () => new HomeCardView());
    this.cardNavigator.register(CARD_VIEW_CONFIRM_REGISTRY_ID, () => new ConfirmCardView());
    // registers the quick view to open via QuickView action
    this.quickViewNavigator.register(QUICK_VIEW_UPLOAD_REGISTRY_ID, () => new UploadQuickView());

    // Initialize the expense report service class
    if (this.properties.serviceBaseUrl) {
      this._expenseReportService = this.context.serviceScope.consume(ExpenseReportService.serviceKey);
      this._expenseReportService.setServiceBaseUrl(this.properties.serviceBaseUrl);
    }

    // Configure the property to create an expense report
    this.properties.createExpenseReport = this.createExpenseReport;

    return Promise.resolve();
  }

  protected loadPropertyPaneResources(): Promise<void> {
    return import(
      /* webpackChunkName: 'ExpenseReport-property-pane'*/
      './ExpenseReportPropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.ExpenseReportPropertyPane();
        }
      );
  }

  protected renderCard(): string | undefined {
    return CARD_VIEW_HOME_REGISTRY_ID;
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return this._deferredPropertyPane?.getPropertyPaneConfiguration();
  }

  public createExpenseReport = async (expenseReport: ExpenseReport): Promise<void> => {
    return this._expenseReportService.createExpenseReport(expenseReport);
  }
}
