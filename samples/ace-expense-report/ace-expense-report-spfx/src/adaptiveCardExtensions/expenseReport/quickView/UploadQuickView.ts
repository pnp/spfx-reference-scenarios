import { ISPFxAdaptiveCard, BaseAdaptiveCardQuickView, BaseQuickView, QuickViewNavigator } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'ExpenseReportAdaptiveCardExtensionStrings';
import {
  CARD_VIEW_CONFIRM_REGISTRY_ID,
  IExpenseReportAdaptiveCardExtensionProps,
  IExpenseReportAdaptiveCardExtensionState
} from '../ExpenseReportAdaptiveCardExtension';
import {ISelectMediaActionArguments} from '@microsoft/sp-adaptive-card-extension-base';

export interface IUploadQuickViewData {
  title: string;
  expenseDescriptionLabel: string;
  expenseDescriptionRequiredMessage: string;
  expenseDescriptionPlaceholder: string;
  expenseCategoryLabel: string;
  expneseCategoryPlaceholder: string;
  expenseCategories: { text: string; key: string }[]
  expenseDateLabel: string;
  expenseDatePlaceholder: string;
  expenseDateRequiredMessage: string;
  expenseUploadButtonLabel: string;
  submitButtonLabel: string;
  expenseDescription?: string;
  expenseCategory?: string;
  expenseDate?: string;
}

export class UploadQuickView extends BaseAdaptiveCardQuickView<
  IExpenseReportAdaptiveCardExtensionProps,
  IExpenseReportAdaptiveCardExtensionState,
  IUploadQuickViewData
> {
  public get data(): IUploadQuickViewData {
    return {
      title: strings.Title,
      expenseDescriptionLabel: strings.ExpenseReport.DescriptionLabel,
      expenseDescriptionRequiredMessage: strings.ExpenseReport.DescriptionRequiredMessage,
      expenseDescriptionPlaceholder: strings.ExpenseReport.DescriptionPlaceholder,
      expenseCategoryLabel: strings.ExpenseReport.CategoryLabel,
      expneseCategoryPlaceholder: strings.ExpenseReport.CategoryPlaceholder,
      expenseCategories: [
        { text: 'Travel', key: 'Travel' },
        { text: 'Food & Beverages', key: 'FoodAndBeverages' },
        { text: 'Hotel', key: 'Hotel' },
        { text: 'Others', key: 'Others' }
      ],
      expenseDateLabel: strings.ExpenseReport.DateLabel,
      expenseDatePlaceholder: strings.ExpenseReport.DatePlaceholder,
      expenseDateRequiredMessage: strings.ExpenseReport.DateRequiredMessage,
      expenseUploadButtonLabel: strings.ExpenseReport.UploadButtonLabel,
      submitButtonLabel: strings.ExpenseReport.SubmitExpenseButtonLabel,
      expenseDescription: this.state.expenseDescription ?? "",
      expenseCategory: this.state.expenseCategory ?? "",
      expenseDate: this.state.expenseDate ?? ""
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/UploadQuickViewTemplate.json');
  }

  public async onAction(action: ISelectMediaActionArguments): Promise<void> {
    console.log(action);
    if (action.type === 'VivaAction.SelectMedia') {
      console.log(action.media);
      // media is an array of attachment objects which contain the content and filename
      this.setState({
        expenseDescription: action.data.expenseDescription,
        expenseCategory: action.data.expenseCategory,
        expenseDate: action.data.expenseDate,
        expenseReceiptFileName: action.media[0].fileName,
        expenseReceiptContent: action.media[0].content // base64 encoded string
      });
    }
    else if (action.type === 'Submit' && action.id === 'submitExpense') {

      if (this.state.expenseReceiptFileName && this.state.expenseReceiptContent) {
        // Create the expense report
        await this.properties.createExpenseReport({
          description: action.data.expenseDescription,
          category: action.data.expenseCategory,
          date: action.data.expenseDate,
          receiptFileName: this.state.expenseReceiptFileName,
          receiptContent: this.state.expenseReceiptContent
        });

        this.setState({
          expenseDescription: undefined,
          expenseCategory: undefined,
          expenseDate: undefined,
          expenseReceiptFileName: undefined,
          expenseReceiptContent: undefined
        });

        (<QuickViewNavigator<BaseQuickView<IExpenseReportAdaptiveCardExtensionProps,IExpenseReportAdaptiveCardExtensionState>>>this.quickViewNavigator).close();
        this.cardNavigator.push(CARD_VIEW_CONFIRM_REGISTRY_ID);
        }
    }
  }
}
