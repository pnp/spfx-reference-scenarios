import { ISPFxAdaptiveCard, BaseAdaptiveCardView } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'SimplelistAdaptiveCardExtensionStrings';
import { Anniversary, Praise } from '../../../common/models/designtemplate.models';
import { ISimplelistAdaptiveCardExtensionProps, ISimplelistAdaptiveCardExtensionState } from '../SimplelistAdaptiveCardExtension';

export interface IQuickViewData {
  mainImage: string;
  anniversaries: Anniversary[];
  praise: Praise[];
  forwardArrow: string;
  strings: ISimplelistAdaptiveCardExtensionStrings;
}

export class QuickView extends BaseAdaptiveCardView<
  ISimplelistAdaptiveCardExtensionProps,
  ISimplelistAdaptiveCardExtensionState,
  IQuickViewData
> {
  public get data(): IQuickViewData {
    return {
      mainImage: require('../../../common/images/simple-list/Dashboard_Praise_bg.png'),
      anniversaries: this.state.app.anniversaries,
      praise: this.state.app.praise,
      forwardArrow: require('../../../common/images/simple-list/arrowforward.png'),
      strings: strings
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }
}