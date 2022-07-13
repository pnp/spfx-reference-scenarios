import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';

import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";

import { VisuallistPropertyPane } from './VisuallistPropertyPane';
import { dtg } from '../../common/services/designtemplate.service';
import { Cafeteria } from '../../common/models/designtemplate.models';
import * as strings from 'VisuallistAdaptiveCardExtensionStrings';

export interface IVisuallistAdaptiveCardExtensionProps {
  iconProperty: string;
  title: string;
}

export interface IVisuallistAdaptiveCardExtensionState {
  cafeterias: Cafeteria[];
}

const CARD_VIEW_REGISTRY_ID: string = 'Visuallist_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'Visuallist_QUICK_VIEW';

export default class VisuallistAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IVisuallistAdaptiveCardExtensionProps,
  IVisuallistAdaptiveCardExtensionState
> {
  private LOG_SOURCE: string = "🔶 Visual List Adaptive Card Extension";
  private _deferredPropertyPane: VisuallistPropertyPane | undefined;

  public onInit(): Promise<void> {
    try {
      //Initialize PnPLogger
      Logger.subscribe(new ConsoleListener());
      Logger.activeLogLevel = LogLevel.Info;

      //Initialize Service
      dtg.Init();

      //Get data
      const cafeterias: Cafeteria[] = dtg.GetCafeterias();

      //Set the data into state
      this.state = {
        cafeterias: cafeterias
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
      /* webpackChunkName: 'Visuallist-property-pane'*/
      './VisuallistPropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.VisuallistPropertyPane();
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
