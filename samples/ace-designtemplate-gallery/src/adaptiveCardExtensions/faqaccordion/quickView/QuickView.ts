import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'FaqaccordionAdaptiveCardExtensionStrings';
import { Logger, LogLevel } from "@pnp/logging";
import { AccordionList, AppList } from '../../../common/models/designtemplate.models';
import { IFaqaccordionAdaptiveCardExtensionProps, IFaqaccordionAdaptiveCardExtensionState } from '../FaqaccordionAdaptiveCardExtension';
import { dtg } from '../../../common/services/designtemplate.service';


export interface IQuickViewData {
  faqApp: AccordionList;
  deepLink: string;
  question: string;
  strings: IFaqaccordionAdaptiveCardExtensionStrings;
}

export class QuickView extends BaseAdaptiveCardView<
  IFaqaccordionAdaptiveCardExtensionProps,
  IFaqaccordionAdaptiveCardExtensionState,
  IQuickViewData
> {
  private LOG_SOURCE: string = "🔶 FAQ Quick View";

  public get data(): IQuickViewData {
    return {
      faqApp: this.state.faqApp.cardData,
      deepLink: this.state.deepLink,
      question: "",
      strings: strings
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }

  public async onAction(action: IActionArguments): Promise<void> {
    try {
      if (action.type === 'Submit') {
        const { id } = action.data;
        if (id === 'submit') {
          dtg.SubmitFAQ(`${strings.LinkText} ${action.data?.question}`);
          this.quickViewNavigator.close();
        }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (onAction) - ${err}`, LogLevel.Error);
    }
  }
}