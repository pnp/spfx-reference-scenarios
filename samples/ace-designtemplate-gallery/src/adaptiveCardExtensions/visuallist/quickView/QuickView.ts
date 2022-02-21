import { ISPFxAdaptiveCard, BaseAdaptiveCardView } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'VisuallistAdaptiveCardExtensionStrings';
import { Cafeteria, Cuisine } from '../../../common/models/designtemplate.models';
import { IVisuallistAdaptiveCardExtensionProps, IVisuallistAdaptiveCardExtensionState } from '../VisuallistAdaptiveCardExtension';

export interface IQuickViewData {
  mainImage: string;
  dividerImage: string;
  rightArrowImage: string;
  statusGraph: string;
  clockIcon: string;
  locationIcon: string;
  foodIcon: string;
  selectedCafeteria: Cafeteria;
  cuisine: Cuisine[];
  strings: IVisuallistAdaptiveCardExtensionStrings;
}

export class QuickView extends BaseAdaptiveCardView<
  IVisuallistAdaptiveCardExtensionProps,
  IVisuallistAdaptiveCardExtensionState,
  IQuickViewData
> {
  public get data(): IQuickViewData {
    return {
      mainImage: require('../../../common/images/visual-list/cafe.jpg'),
      dividerImage: require('../../../common/images/visual-list/line_pivot_dark.svg'),
      rightArrowImage: require('../../../common/images/visual-list/arrow-right.png'),
      statusGraph: require('../../../common/images/visual-list/graph.gif'),
      clockIcon: require('../../../common/images/visual-list/icn_hours.svg'),
      locationIcon: require('../../../common/images/visual-list/icn_location.svg'),
      foodIcon: require('../../../common/images/visual-list/icn_venues.svg'),
      selectedCafeteria: this.state.cafeterias[0],
      cuisine: this.state.cafeterias[0].cuisine,
      strings: strings
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }
}