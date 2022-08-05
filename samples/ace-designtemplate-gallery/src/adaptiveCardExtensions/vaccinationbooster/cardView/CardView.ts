import {
  BaseImageCardView,
  IImageCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'VaccinationboosterAdaptiveCardExtensionStrings';
import { IVaccinationboosterAdaptiveCardExtensionProps, QUICK_VIEW_REGISTRY_ID } from '../VaccinationboosterAdaptiveCardExtension';

export class CardView extends BaseImageCardView<IVaccinationboosterAdaptiveCardExtensionProps> {

  public get data(): IImageCardParameters {
    let text: string = strings.CardViewTitleShort;
    if (this.cardSize == "Large") {
      text = strings.CardViewTitle;
    }
    return {
      primaryText: text,
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
