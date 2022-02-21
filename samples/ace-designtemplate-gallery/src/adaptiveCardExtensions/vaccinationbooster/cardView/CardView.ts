import {
  BaseImageCardView,
  IImageCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction,
  ICardButton
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'VaccinationboosterAdaptiveCardExtensionStrings';
import { IVaccinationboosterAdaptiveCardExtensionProps, IVaccinationboosterAdaptiveCardExtensionState, QUICK_VIEW_REGISTRY_ID } from '../VaccinationboosterAdaptiveCardExtension';

export class CardView extends BaseImageCardView<IVaccinationboosterAdaptiveCardExtensionProps, IVaccinationboosterAdaptiveCardExtensionState> {

  public get data(): IImageCardParameters {
    return {
      primaryText: strings.CardViewTitle,
      imageUrl: require('../../../common/images/vaccination-booster/vaccineimage.jpg')
    };
  }

  public get onCardSelection(): IQuickViewCardAction | IExternalLinkCardAction | undefined {
    return {
      type: 'QuickView',
      parameters: {
        view: QUICK_VIEW_REGISTRY_ID
      }
    };
  }
}
