import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'ExpensereportAdaptiveCardExtensionStrings';
import { Expense, ExpenseField, ExpenseReport } from '../../../models/cg.models';
import { IExpensereportAdaptiveCardExtensionProps, IExpensereportAdaptiveCardExtensionState } from '../ExpensereportAdaptiveCardExtension';

export interface IQuickViewData {
  id: number;
  code: string;
  message: string;
  createdByName: string;
  createdDate: string;
  submittedDate: string;
  createrEmail: string;
  status: string;
  statusUrl: string;
  approver: string;
  purpose: string;
  approvalDate: string;
  approverEmail: string;
  otherSubmitter: string;
  otherSubmitterEmail: string;
  expenses: Expense[];
}

export class QuickView extends BaseAdaptiveCardView<
  IExpensereportAdaptiveCardExtensionProps,
  IExpensereportAdaptiveCardExtensionState,
  IQuickViewData
> {
  public get data(): IQuickViewData {
    const expenseReport = this.state.expenseReports[this.state.currentIndex];
    return {
      id: expenseReport.id,
      code: expenseReport.code,
      message: expenseReport.message,
      createdByName: expenseReport.createdByName,
      createdDate: expenseReport.createdDate,
      submittedDate: expenseReport.submittedDate,
      createrEmail: expenseReport.createrEmail,
      status: expenseReport.status,
      statusUrl: expenseReport.statusUrl,
      approver: expenseReport.approver,
      purpose: expenseReport.purpose,
      approvalDate: expenseReport.approvalDate,
      approverEmail: expenseReport.approverEmail,
      otherSubmitter: expenseReport.otherSubmitter,
      otherSubmitterEmail: expenseReport.otherSubmitterEmail,
      expenses: expenseReport.expenses
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }
  public async onAction(action: IActionArguments): Promise<void> {
    if (action.type === 'Submit') {
      const { id, newIndex } = action.data;
      if (id === 'approve') {
        let expenseReports = this.state.expenseReports;
        let expenseReport = expenseReports[this.state.currentIndex];
        expenseReport.status = "Approved";
        expenseReport.statusUrl = "https://adaptivecards.io/content/approved.png";
        expenseReport.approvalDate = new Date().toLocaleDateString();
        this.setState({ expenseReports: expenseReports });
        this.quickViewNavigator.close();
      } else if (id === 'rejectsend') {
        let expenseReports = this.state.expenseReports;
        let expenseReport = expenseReports[this.state.currentIndex];
        expenseReport.status = "Rejected";
        expenseReport.statusUrl = "https://adaptivecards.io/content/rejected.png";
        expenseReport.approvalDate = new Date().toLocaleDateString();
        this.setState({ expenseReports: expenseReports });
        this.quickViewNavigator.close();
      } else if (id === 'send') {
        let expenseReports: ExpenseReport[] = this.state.expenseReports;
        let expenseReport: ExpenseReport = expenseReports[this.state.currentIndex];
        expenseReport.expenses[0].customFields.push(new ExpenseField(expenseReport.expenses[0].customFields.length, action.data.comment0, action.data.comment0));
        this.setState({ expenseReports: expenseReports });
      }
    }
  }
}