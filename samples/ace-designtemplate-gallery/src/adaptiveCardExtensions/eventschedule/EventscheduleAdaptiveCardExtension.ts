import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { EventschedulePropertyPane } from './EventschedulePropertyPane';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { ConfirmView } from './quickView/ConfirmView';

import { sp } from "@pnp/sp";
import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";

import { dtg } from '../../common/services/designtemplate.service';
import { App, EventRegistration, IEventRegistration } from '../../common/models/designtemplate.models';


export interface IEventscheduleAdaptiveCardExtensionProps {
  title: string;
  description: string;
  iconProperty: string;
}

export interface IEventscheduleAdaptiveCardExtensionState {
  eventsApp: App;
  selectedDay: number;
  showRegister: boolean;
  registrationData: IEventRegistration;
}

const CARD_VIEW_REGISTRY_ID: string = 'Eventschedule_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'Eventschedule_QUICK_VIEW';
export const CONFIRM_VIEW_REGISTRY_ID: string = 'Eventschedule_CONFIRM_VIEW';

export default class EventscheduleAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IEventscheduleAdaptiveCardExtensionProps,
  IEventscheduleAdaptiveCardExtensionState
> {

  private LOG_SOURCE: string = "🔶 Event Schedule Adaptive Card Extension";
  private _deferredPropertyPane: EventschedulePropertyPane | undefined;

  public onInit(): Promise<void> {
    try {
      //Initialize PnPLogger
      Logger.subscribe(new ConsoleListener());
      Logger.activeLogLevel = LogLevel.Info;

      //Initialize PnPJs
      sp.setup({ spfxContext: this.context });

      //Initialize Service
      dtg.Init();

      //Get the data for the app
      const eventsApp: App = dtg.GetEvents();

      //Set the data into state
      this.state = {
        eventsApp: eventsApp,
        selectedDay: 1,
        showRegister: false,
        registrationData: new EventRegistration()
      };
      //Register the cards
      this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
      this.quickViewNavigator.register(QUICK_VIEW_REGISTRY_ID, () => new QuickView());
      this.quickViewNavigator.register(CONFIRM_VIEW_REGISTRY_ID, () => new ConfirmView());
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
      /* webpackChunkName: 'Eventschedule-property-pane'*/
      './EventschedulePropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.EventschedulePropertyPane();
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
