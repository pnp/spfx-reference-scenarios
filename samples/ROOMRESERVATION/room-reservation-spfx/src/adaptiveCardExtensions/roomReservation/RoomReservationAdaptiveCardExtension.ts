import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';

import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";
import { sp } from "@pnp/sp";
import remove from 'lodash/remove';

import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { RoomReservationPropertyPane } from './RoomReservationPropertyPane';
import { rr } from '../../webparts/roomReservation/services/rr.service';
import { IMeetingResult } from '../../webparts/roomReservation/models/rr.models';


export interface IRoomReservationAdaptiveCardExtensionProps {
  iconProperty: string;
}

export interface IRoomReservationAdaptiveCardExtensionState {
  currentMeetingIndex: number;
  meetings: IMeetingResult[];
  teamsUrl: string;
  covidAppUrl: string;
}

const CARD_VIEW_REGISTRY_ID: string = 'RoomReservation_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'RoomReservation_QUICK_VIEW';

export default class RoomReservationAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IRoomReservationAdaptiveCardExtensionProps,
  IRoomReservationAdaptiveCardExtensionState
> {
  private LOG_SOURCE: string = "🔶 RoomReservationAdaptiveCardExtension";

  private _deferredPropertyPane: RoomReservationPropertyPane | undefined;

  public async onInit(): Promise<void> {
    try {
      //Initialize PnPLogger
      Logger.subscribe(new ConsoleListener());
      Logger.activeLogLevel = LogLevel.Info;

      //Initialize PnPJs
      sp.setup({ spfxContext: this.context });

      await rr.Init(this.context.pageContext.cultureInfo.currentUICultureName);
      const meetings: IMeetingResult[] = rr.GetMeetings();
      remove(meetings, { roomId: -1 });

      this.state = {
        currentMeetingIndex: 0,
        meetings: meetings,
        teamsUrl: "https://teams.microsoft.com/l/entity/a813fd59-485e-499d-9cb4-44fc70b10723/0",
        covidAppUrl: "https://teams.microsoft.com/l/entity/3ab8fb75-8f80-4ff1-90a3-6f711ad27c1d/0"
      };

      this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
      this.quickViewNavigator.register(QUICK_VIEW_REGISTRY_ID, () => new QuickView());
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (onInit) - ${err.message} - `, LogLevel.Error);
    }
  }

  protected get iconProperty(): string {
    return require('./assets/SharePointLogo.svg');
  }

  protected loadPropertyPaneResources(): Promise<void> {
    return import(
      /* webpackChunkName: 'RoomReservation-property-pane'*/
      './RoomReservationPropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.RoomReservationPropertyPane();
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
