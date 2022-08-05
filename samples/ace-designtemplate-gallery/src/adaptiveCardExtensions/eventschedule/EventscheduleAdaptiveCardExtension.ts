import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { EventschedulePropertyPane } from './EventschedulePropertyPane';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { ConfirmView } from './quickView/ConfirmView';

import { dtg } from '../../common/services/designtemplate.service';
import { Event, EventRegistration, IEventRegistration } from '../../common/models/designtemplate.models';

export interface IEventscheduleAdaptiveCardExtensionProps {
  iconProperty: string;
  title: string;
}

export interface IEventscheduleAdaptiveCardExtensionState {
  eventsApp: Event;
  selectedDay: number;
  showRegister: boolean;
  registrationData: IEventRegistration;
}

const CARD_VIEW_REGISTRY_ID = 'Eventschedule_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID = 'Eventschedule_QUICK_VIEW';
export const CONFIRM_VIEW_REGISTRY_ID = 'Eventschedule_CONFIRM_VIEW';

export default class EventscheduleAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IEventscheduleAdaptiveCardExtensionProps,
  IEventscheduleAdaptiveCardExtensionState
> {

  private LOG_SOURCE = "🔶 Event Schedule Adaptive Card Extension";
  private _deferredPropertyPane: EventschedulePropertyPane | undefined;

  public async onInit(): Promise<void> {
    try {
      //Initialize Service
      await dtg.Init(this.context.serviceScope);

      //Get the data for the app
      const eventsApp: Event = dtg.GetEvents();

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
