import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';

import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";

import { TimeoffPropertyPane } from './TimeoffPropertyPane';
import { dtg } from '../../common/services/designtemplate.service';
import * as strings from 'TimeoffAdaptiveCardExtensionStrings';
import { TimeOff } from '../../common/models/designtemplate.models';

export interface ITimeoffAdaptiveCardExtensionProps {
  iconProperty: string;
  title: string;
}

export interface ITimeoffAdaptiveCardExtensionState {
  timeoff: TimeOff;
}

const CARD_VIEW_REGISTRY_ID: string = 'Timeoff_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'Timeoff_QUICK_VIEW';

export default class TimeoffAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  ITimeoffAdaptiveCardExtensionProps,
  ITimeoffAdaptiveCardExtensionState
> {
  private LOG_SOURCE: string = "🔶 Time Off Adaptive Card Extension";
  private _deferredPropertyPane: TimeoffPropertyPane | undefined;

  public onInit(): Promise<void> {
    try {
      //Initialize PnPLogger
      Logger.subscribe(new ConsoleListener());
      Logger.activeLogLevel = LogLevel.Info;

      //Initialize Service
      dtg.Init();

      const timeoff: TimeOff = dtg.GetTimeOff();

      //Set the data into state
      this.state = {
        timeoff: timeoff
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
      /* webpackChunkName: 'Timeoff-property-pane'*/
      './TimeoffPropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.TimeoffPropertyPane();
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
