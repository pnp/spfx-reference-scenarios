import {
  BaseImageCardView,
  IImageCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction
} from '@microsoft/sp-adaptive-card-extension-base';
import { ITimelineholidayAdaptiveCardExtensionProps, ITimelineholidayAdaptiveCardExtensionState, QUICK_VIEW_REGISTRY_ID } from '../TimelineholidayAdaptiveCardExtension';

export class CardView extends BaseImageCardView<ITimelineholidayAdaptiveCardExtensionProps, ITimelineholidayAdaptiveCardExtensionState> {
  public get data(): IImageCardParameters {
    let imageUrl = "";
    const today: Date = new Date();
    if (today.getMonth() >= 0 && today.getMonth() <= 2) {
      imageUrl = require('../../../common/images/timeline-holidays/winter.jpg');
    } else if (today.getMonth() >= 3 && today.getMonth() <= 5) {
      imageUrl = require('../../../common/images/timeline-holidays/spring.jpg');
    } else if (today.getMonth() >= 6 && today.getMonth() <= 8) {
      imageUrl = require('../../../common/images/timeline-holidays/summer.jpg');
    } else if (today.getMonth() >= 9 && today.getMonth() <= 10) {
      imageUrl = require('../../../common/images/timeline-holidays/autumn.jpg');
    } else if (today.getMonth() == 11) {
      imageUrl = require('../../../common/images/timeline-holidays/winter.jpg');
    }

    const nextHolidayDate: Date = new Date(this.state.nextHoliday.date);
    let separator = "";
    if (navigator.userAgent.toLowerCase().indexOf("android") > -1) {
      separator = " - ";
    } else {
      separator = "\n\n";
    }
    const cardText = `${this.state.nextHoliday.title}${separator}${Intl.DateTimeFormat(this.context.pageContext.cultureInfo.currentUICultureName, { weekday: undefined, year: undefined, month: 'long', day: 'numeric' }).format(nextHolidayDate)}`;

    return {
      primaryText: cardText,
      imageUrl: imageUrl
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
