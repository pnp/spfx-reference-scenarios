import { ExpenseReport } from '../models/ExpenseReport';

export interface IExpenseReportService {

    setServiceBaseUrl(serviceBaseUrl: string): void;

    createExpenseReport(expenseReport: ExpenseReport): Promise<void>;
}