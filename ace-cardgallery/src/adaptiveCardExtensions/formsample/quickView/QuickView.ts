import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'FormsampleAdaptiveCardExtensionStrings';
import { IFormsampleAdaptiveCardExtensionProps, IFormsampleAdaptiveCardExtensionState } from '../FormsampleAdaptiveCardExtension';

export interface IQuickViewData {
  formSample;
}

export class QuickView extends BaseAdaptiveCardView<
  IFormsampleAdaptiveCardExtensionProps,
  IFormsampleAdaptiveCardExtensionState,
  IQuickViewData
> {
  public get data(): IQuickViewData {
    return {
      formSample: this.state.formSample
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }

  public async onAction(action: IActionArguments): Promise<void> {
    if (action.type === 'Submit') {
      const { id, newIndex } = action.data;
      if (id === 'submit') {
        //This is where we could call a function in the service layer to
        //save the data.
        this.quickViewNavigator.close();
      }
    }
  }
}