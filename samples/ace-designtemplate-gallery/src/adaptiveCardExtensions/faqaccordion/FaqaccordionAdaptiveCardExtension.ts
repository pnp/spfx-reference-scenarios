import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { FaqaccordionPropertyPane } from './FaqaccordionPropertyPane';

import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";

import { dtg } from '../../common/services/designtemplate.service';
import { AccordionList } from '../../common/models/designtemplate.models';

export interface IFaqaccordionAdaptiveCardExtensionProps {
  iconProperty: string;
  title: string;
}

export interface IFaqaccordionAdaptiveCardExtensionState {
  faqApp: AccordionList;
  deepLink: string;
}

const CARD_VIEW_REGISTRY_ID: string = 'Faqaccordion_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'Faqaccordion_QUICK_VIEW';

export default class FaqaccordionAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IFaqaccordionAdaptiveCardExtensionProps,
  IFaqaccordionAdaptiveCardExtensionState
> {
  private LOG_SOURCE: string = "🔶 FAQ Adaptive Card Extension";
  private _deferredPropertyPane: FaqaccordionPropertyPane | undefined;

  public onInit(): Promise<void> {
    try {
      //Initialize PnPLogger
      Logger.subscribe(new ConsoleListener());
      Logger.activeLogLevel = LogLevel.Info;

      //Initialize Service
      dtg.Init();

      //Get the data for the app
      const faqApp: AccordionList = dtg.GetFAQs();

      //Set the data into state
      this.state = {
        faqApp: faqApp,
        deepLink: dtg.TeamsUrl
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
      /* webpackChunkName: 'Faqaccordion-property-pane'*/
      './FaqaccordionPropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.FaqaccordionPropertyPane();
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
