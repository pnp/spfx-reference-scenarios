import { BaseAdaptiveCardView, IActionArguments, ISPFxAdaptiveCard } from '@microsoft/sp-adaptive-card-extension-base';
import { IWellbeingRequest, IWellbeingRequestsAdaptiveCardExtensionProps, IWellbeingRequestsAdaptiveCardExtensionState } from '../WellbeingRequestsAdaptiveCardExtension';

export interface IQuickViewData {
  requests: IWellbeingRequest[];
}

export class QuickView extends BaseAdaptiveCardView<
  IWellbeingRequestsAdaptiveCardExtensionProps,
  IWellbeingRequestsAdaptiveCardExtensionState,
  IQuickViewData
> {
  public get data(): IQuickViewData {
    return {
      requests: this.state.requests
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }
}