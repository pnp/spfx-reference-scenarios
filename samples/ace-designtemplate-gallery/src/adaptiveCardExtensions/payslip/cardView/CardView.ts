import {
  BasePrimaryTextCardView,
  IPrimaryTextCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'PayslipAdaptiveCardExtensionStrings';
import { IPayslipAdaptiveCardExtensionProps, IPayslipAdaptiveCardExtensionState, QUICK_VIEW_REGISTRY_ID } from '../PayslipAdaptiveCardExtension';

export class CardView extends BasePrimaryTextCardView<IPayslipAdaptiveCardExtensionProps, IPayslipAdaptiveCardExtensionState> {
  public get data(): IPrimaryTextCardParameters {
    const nextPayDate: Date = new Date(this.state.currentPayPeriod.endDate);
    return {
      primaryText: Intl.DateTimeFormat(this.context.pageContext.cultureInfo.currentUICultureName, { weekday: undefined, year: undefined, month: 'long', day: 'numeric' }).format(nextPayDate),
      description: strings.CardViewText
    };
  }

  public get onCardSelection(): IQuickViewCardAction | IExternalLinkCardAction | undefined {
    return {
      type: 'QuickView',
      parameters: {
        view: QUICK_VIEW_REGISTRY_ID
      }
    };
  }
}
