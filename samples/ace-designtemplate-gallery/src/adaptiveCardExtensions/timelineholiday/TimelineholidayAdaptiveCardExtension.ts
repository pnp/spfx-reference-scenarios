import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';

import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";

import { TimelineholidayPropertyPane } from './TimelineholidayPropertyPane';
import { dtg } from '../../common/services/designtemplate.service';
import * as strings from 'TimelineholidayAdaptiveCardExtensionStrings';
import { Holiday, HolidayTimeline } from '../../common/models/designtemplate.models';

export interface ITimelineholidayAdaptiveCardExtensionProps {
  iconProperty: string;
  title: string;
}

export interface ITimelineholidayAdaptiveCardExtensionState {
  holidays: Holiday[];
  years: string[];
  nextHoliday: Holiday;
}

const CARD_VIEW_REGISTRY_ID: string = 'Timelineholiday_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'Timelineholiday_QUICK_VIEW';

export default class TimelineholidayAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  ITimelineholidayAdaptiveCardExtensionProps,
  ITimelineholidayAdaptiveCardExtensionState
> {
  private LOG_SOURCE: string = "🔶 Timeline-Holiday Adaptive Card Extension";

  private _deferredPropertyPane: TimelineholidayPropertyPane | undefined;

  public onInit(): Promise<void> {
    try {
      //Initialize PnPLogger
      Logger.subscribe(new ConsoleListener());
      Logger.activeLogLevel = LogLevel.Info;

      //Initialize Service
      dtg.Init();

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
      Logger.write(`${this.LOG_SOURCE} (onInit) - ${err}`, LogLevel.Error);
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
