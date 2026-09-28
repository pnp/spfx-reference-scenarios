import { ISPFxAdaptiveCard, BaseAdaptiveCardView, ISubmitActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'TimeoffAdaptiveCardExtensionStrings';
import { TimeOff, TimeOffRequest } from '../../../common/models/designtemplate.models';
import { dtg } from '../../../common/services/designtemplate.service';
import { ITimeoffAdaptiveCardExtensionProps, ITimeoffAdaptiveCardExtensionState } from '../TimeoffAdaptiveCardExtension';

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
  private LOG_SOURCE = "🔶 Time off Quick View";

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
        const { id } = action;
        if (id === 'btn_cancel') {
          this.quickViewNavigator.close();
        } else if (id === 'btn_submit') {
          const request: TimeOffRequest = new TimeOffRequest(action.data?.inp_sick, action.data?.tgl_all_day, new Date(action.data?.drp_date));
          dtg.SubmitTimeOffRequest(request);
          this.quickViewNavigator.close();
        }
      }
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (onAction) -- click event not handled. - ${err}`
      );
    }
  }
}