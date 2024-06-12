import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { FaqaccordionPropertyPane } from './FaqaccordionPropertyPane';

import { AccordionList } from '../../common/models/designtemplate.models';
import { dtg } from '../../common/services/designtemplate.service';

export interface IFaqaccordionAdaptiveCardExtensionProps {
  iconProperty: string;
  title: string;
  deepLink: string;
}

export interface IFaqaccordionAdaptiveCardExtensionState {
  faqApp: AccordionList;
}

const CARD_VIEW_REGISTRY_ID = 'Faqaccordion_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID = 'Faqaccordion_QUICK_VIEW';

export default class FaqaccordionAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IFaqaccordionAdaptiveCardExtensionProps,
  IFaqaccordionAdaptiveCardExtensionState
> {
  private LOG_SOURCE = "🔶 FAQ Adaptive Card Extension";
  private _deferredPropertyPane: FaqaccordionPropertyPane | undefined;

  public async onInit(): Promise<void> {
    try {
      //Initialize Service
      await dtg.Init(this.context.serviceScope);
      this.properties.deepLink = dtg.TeamsUrl;

      //Get the data for the app
      const faqApp: AccordionList = dtg.GetFAQs();

      //Set the data into state
      this.state = {
        faqApp: faqApp
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
