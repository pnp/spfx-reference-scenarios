import { ISPFxAdaptiveCard, BaseAdaptiveCardView, ISubmitActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'TimeoffAdaptiveCardExtensionStrings';
import { Logger, LogLevel } from "@pnp/logging";
import { TimeOff, TimeOffRequest } from '../../../common/models/designtemplate.models';
import { ITimeoffAdaptiveCardExtensionProps, ITimeoffAdaptiveCardExtensionState } from '../TimeoffAdaptiveCardExtension';
import { dtg } from '../../../common/services/designtemplate.service';

export interface IQuickViewData {
  timeOff: TimeOff;
  mainImage: string;
  sickTimeIcon: string;
  ptoIcon: string;
  wellnessIcon: string;
  today: string;
  strings: ITimeoffAdaptiveCardExtensionStrings;
}

export class QuickView extends BaseAdaptiveCardView<
  ITimeoffAdaptiveCardExtensionProps,
  ITimeoffAdaptiveCardExtensionState,
  IQuickViewData
> {
  private LOG_SOURCE: string = "🔶 Time off Quick View";

  public get data(): IQuickViewData {
    const today: Date = new Date();
    return {
      timeOff: this.state.timeoff,
      mainImage: require('../../../common/images/timeoff/plane.jpg'),
      sickTimeIcon: require('../../../common/images/timeoff/icn_medical.svg'),
      ptoIcon: require('../../../common/images/timeoff/icn_beach.svg'),
      wellnessIcon: require('../../../common/images/timeoff/icn_leaves_two.svg'),
      today: `${today.getFullYear()}-0${today.getUTCMonth() + 1}-${today.getDate()}`,
      strings: strings
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }
  public async onAction(action: ISubmitActionArguments): Promise<void> {
    try {
      if (action.type === 'Submit') {
        const { id, data } = action;
        if (id === 'btn_cancel') {
          this.quickViewNavigator.close();
        } else if (id === 'btn_submit') {
          const request: TimeOffRequest = new TimeOffRequest(action.data?.inp_sick, action.data?.tgl_all_day, new Date(action.data?.drp_date));
          dtg.SubmitTimeOffRequest(request);
          this.quickViewNavigator.close();
        }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (onAction) - ${err}`, LogLevel.Error);
    }
  }
}