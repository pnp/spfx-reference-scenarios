import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';

import { VaccinationboosterPropertyPane } from './VaccinationboosterPropertyPane';
import { dtg } from '../../common/services/designtemplate.service';

export interface IVaccinationboosterAdaptiveCardExtensionProps {
  iconProperty: string;
  title: string;
}

const CARD_VIEW_REGISTRY_ID = 'Vaccinationbooster_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID = 'Vaccinationbooster_QUICK_VIEW';

export default class VaccinationboosterAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IVaccinationboosterAdaptiveCardExtensionProps
> {
  private LOG_SOURCE = "🔶 Vaccination Booster Adaptive Card Extension";
  private _deferredPropertyPane: VaccinationboosterPropertyPane | undefined;

  public async onInit(): Promise<void> {
    try {
      await dtg.Init(this.context.serviceScope);

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
      /* webpackChunkName: 'Vaccinationbooster-property-pane'*/
      './VaccinationboosterPropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.VaccinationboosterPropertyPane();
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
