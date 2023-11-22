import { ISPFxAdaptiveCard, BaseAdaptiveCardQuickView, IActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'ManageOrdersAdaptiveCardExtensionStrings';
import { IManageOrdersAdaptiveCardExtensionProps, IManageOrdersAdaptiveCardExtensionState } from '../ManageOrdersAdaptiveCardExtension';

export interface IConfirmQuickViewData {
  title: string;
  description: string;
  imageUrl: string;
}

export class ConfirmQuickView extends BaseAdaptiveCardQuickView<
  IManageOrdersAdaptiveCardExtensionProps,
  IManageOrdersAdaptiveCardExtensionState,
  IConfirmQuickViewData
> {
  public get data(): IConfirmQuickViewData {
    return {
      title: strings.ConfirmTitle,
      description: strings.ConfirmDescription,
      imageUrl: require('../assets/success.png')
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/ConfirmQuickViewTemplate.json');
  }
}