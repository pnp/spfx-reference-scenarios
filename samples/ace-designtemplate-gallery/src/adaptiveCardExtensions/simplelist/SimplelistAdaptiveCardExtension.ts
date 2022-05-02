import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';

import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";

import { SimplelistPropertyPane } from './SimplelistPropertyPane';
import * as strings from 'SimplelistAdaptiveCardExtensionStrings';
import { dtg } from '../../common/services/designtemplate.service';
import { SimpleList } from '../../common/models/designtemplate.models';


export interface ISimplelistAdaptiveCardExtensionProps {
  iconProperty: string;
  title: string;
}

export interface ISimplelistAdaptiveCardExtensionState {
  app: SimpleList;
}

const CARD_VIEW_REGISTRY_ID: string = 'Simplelist_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'Simplelist_QUICK_VIEW';

export default class SimplelistAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  ISimplelistAdaptiveCardExtensionProps,
  ISimplelistAdaptiveCardExtensionState
> {

  private LOG_SOURCE: string = "🔶 Simple List Adaptive Card Extension";
  private _deferredPropertyPane: SimplelistPropertyPane | undefined;

  public onInit(): Promise<void> {
    try {
      //Initialize PnPLogger
      Logger.subscribe(new ConsoleListener());
      Logger.activeLogLevel = LogLevel.Info;

      //Initialize Service
      dtg.Init();

      //Get the data for the app
      const app: SimpleList = dtg.GetSimpleList(this.context.pageContext.cultureInfo.currentUICultureName);

      //Set the data into state
      this.state = {
        app: app
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
      /* webpackChunkName: 'Simplelist-property-pane'*/
      './SimplelistPropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.SimplelistPropertyPane();
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
