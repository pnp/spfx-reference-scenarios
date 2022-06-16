import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';

import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";

import { TeamcalendarPropertyPane } from './TeamcalendarPropertyPane';
import * as strings from 'TeamcalendarAdaptiveCardExtensionStrings';
import { dtg } from '../../common/services/designtemplate.service';
import { Appointment, Day, IDay } from '../../common/models/designtemplate.models';

export interface ITeamcalendarAdaptiveCardExtensionProps {
  iconProperty: string;
  title: string;
}

export interface ITeamcalendarAdaptiveCardExtensionState {
  days: Day[];
  viewDate: Date;
  selectedSunday: Day;
  selectedAppointments: Appointment[];
}

const CARD_VIEW_REGISTRY_ID: string = 'Teamcalendar_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'Teamcalendar_QUICK_VIEW';

export default class TeamcalendarAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  ITeamcalendarAdaptiveCardExtensionProps,
  ITeamcalendarAdaptiveCardExtensionState
> {
  private LOG_SOURCE: string = "🔶 Team Calendar Adaptive Card Extension";
  private _deferredPropertyPane: TeamcalendarPropertyPane | undefined;

  public onInit(): Promise<void> {

    try {
      //Initialize PnPLogger
      Logger.subscribe(new ConsoleListener());
      Logger.activeLogLevel = LogLevel.Info;

      //Initialize Service
      dtg.Init();

      let local: string = this.context.pageContext.cultureInfo.currentUICultureName;

      //Get the data for the app
      const days: IDay[] = dtg.getCalendarDays(new Date(), local);
      const today: Date = new Date();
      let weekdayIndex: number = today.getDate() - today.getDay();
      if (weekdayIndex < 0) {
        weekdayIndex = 0;
      }
      let selectedSunday: Day = new Day(today.getMonth(), 0, weekdayIndex);

      //Set the data into state
      this.state = {
        days: days,
        viewDate: new Date(),
        selectedSunday: selectedSunday,
        selectedAppointments: dtg.GetThisWeekData(new Date(), local)
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
      /* webpackChunkName: 'Teamcalendar-property-pane'*/
      './TeamcalendarPropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.TeamcalendarPropertyPane();
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
