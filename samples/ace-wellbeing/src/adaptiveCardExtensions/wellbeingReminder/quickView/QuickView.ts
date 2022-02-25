import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'WellbeingReminderAdaptiveCardExtensionStrings';
import { IWellbeingReminderAdaptiveCardExtensionProps, IWellbeingReminderAdaptiveCardExtensionState } from '../WellbeingReminderAdaptiveCardExtension';
import { SPHttpClient } from '@microsoft/sp-http';

export interface IQuickViewData {
  subTitle: string;
  title: string;
  description: string;
}

export class QuickView extends BaseAdaptiveCardView<
  IWellbeingReminderAdaptiveCardExtensionProps,
  IWellbeingReminderAdaptiveCardExtensionState,
  IQuickViewData
> {
  public get data(): IQuickViewData {
    let daySuffix : string = this.state.remainingWellbeingDays > 1 ? 's' : '';
    return {
      subTitle: `You have ${this.state.remainingWellbeingDays} more wellbeing day${daySuffix}. Schedule one to recharge`,
      title: 'Take a wellbeing day',
      description: this.properties.description
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }

  public onAction(action: IActionArguments): void {
    if (action.type !== 'Submit') {
      return;
    }

    this.context.spHttpClient
      .post(`${this.context.pageContext.web.absoluteUrl}/_api/web/ensureUser('${this.context.pageContext.user.loginName}')?$select=Id`, SPHttpClient.configurations.v1, {
        headers: {
          'content-type': 'application/json;odata.metadata=none',
          accept: 'application/json;odata.metadata=none'
        }
      })
      .then(res => res.json())
      .then(user => this.context.spHttpClient.post(`${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getByTitle('${this.properties.wellbeingListName}')/items`, SPHttpClient.configurations.v1, {
        headers: {
          'content-type': 'application/json;odata.metadata=none',
          accept: 'application/json;odata.metadata=none'
        },
        body: JSON.stringify({
          EmployeeId: user.Id,
          Date: action.data.date,
          Comments: action.data.comments
        })
      }))
      .then(_ => {
        this.setState({ remainingWellbeingDays: this.state.remainingWellbeingDays - 1 });
        this.quickViewNavigator.close();
      });
  }
}