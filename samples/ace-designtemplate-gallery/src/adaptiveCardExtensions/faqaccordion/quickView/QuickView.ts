import { ISPFxAdaptiveCard, BaseAdaptiveCardView, ISubmitActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'FaqaccordionAdaptiveCardExtensionStrings';
import { Logger, LogLevel } from "@pnp/logging";
import { AccordionList, AppList } from '../../../common/models/designtemplate.models';
import { IFaqaccordionAdaptiveCardExtensionProps, IFaqaccordionAdaptiveCardExtensionState } from '../FaqaccordionAdaptiveCardExtension';
import { dtg } from '../../../common/services/designtemplate.service';


export interface IQuickViewData {
  faqApp: AccordionList;
  deepLink: string;
  question: string;
  upIcon: string;
  downIcon: string;
  strings: IFaqaccordionAdaptiveCardExtensionStrings;
}

export class QuickView extends BaseAdaptiveCardView<
  IFaqaccordionAdaptiveCardExtensionProps,
  IFaqaccordionAdaptiveCardExtensionState,
  IQuickViewData
> {
  private LOG_SOURCE: string = "🔶 FAQ Quick View";

  public get data(): IQuickViewData {
    const upIcon: string = require('../../../common/images/faq-accordion/ico-up.png');
    const downIcon: string = require('../../../common/images/faq-accordion/ico-down.png');
    return {
      faqApp: this.state.faqApp,
      deepLink: this.state.deepLink,
      question: "",
      upIcon: upIcon,
      downIcon: downIcon,
      strings: strings
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }

  public async onAction(action: ISubmitActionArguments): Promise<void> {
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