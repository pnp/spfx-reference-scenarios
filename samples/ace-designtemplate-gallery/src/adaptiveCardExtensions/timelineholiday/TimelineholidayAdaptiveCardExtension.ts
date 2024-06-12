import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';

import { TimelineholidayPropertyPane } from './TimelineholidayPropertyPane';
import { Holiday, HolidayTimeline } from '../../common/models/designtemplate.models';
import { dtg } from '../../common/services/designtemplate.service';

export interface ITimelineholidayAdaptiveCardExtensionProps {
  iconProperty: string;
  title: string;
}

export interface ITimelineholidayAdaptiveCardExtensionState {
  holidays: Holiday[];
  years: string[];
  nextHoliday: Holiday;
}

const CARD_VIEW_REGISTRY_ID = 'Timelineholiday_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID = 'Timelineholiday_QUICK_VIEW';

export default class TimelineholidayAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  ITimelineholidayAdaptiveCardExtensionProps,
  ITimelineholidayAdaptiveCardExtensionState
> {
  private LOG_SOURCE = "🔶 Timeline-Holiday Adaptive Card Extension";
  private _deferredPropertyPane: TimelineholidayPropertyPane | undefined;

  public async onInit(): Promise<void> {
    try {
      //Initialize Service
      await dtg.Init(this.context.serviceScope);

      const timline: HolidayTimeline = dtg.GetHolidayTimeline(this.context.pageContext.cultureInfo.currentUICultureName);

      //Set the data into state
      this.state = {
        holidays: timline.holidays,
        years: timline.years,
        nextHoliday: timline.nextHoliday
      };
      //Register the cards
      this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
      this.quickViewNavigator.register(QUICK_VIEW_REGISTRY_ID, () => new QuickView());
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (onInit) -- Could not initialize web part. - ${err}`
      );
    }
    return Promise.resolve();
  }

  public get title(): string {
    return this.properties.title;
  }

  protected get iconProperty(): string {
    return this.properties.iconProperty || require('./assets/SharePointLogo.svg');
  }

  protected loadPropertyPaneResources(): Promise<void> {
    return import(
      /* webpackChunkName: 'Timelineholiday-property-pane'*/
      './TimelineholidayPropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.TimelineholidayPropertyPane();
        }
      );
  }

  protected renderCard(): string | undefined {
    return CARD_VIEW_REGISTRY_ID;
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return this._deferredPropertyPane!.getPropertyPaneConfiguration();
  }
}
