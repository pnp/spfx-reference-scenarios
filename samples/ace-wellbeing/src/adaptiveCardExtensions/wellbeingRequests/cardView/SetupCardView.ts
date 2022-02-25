import {
    BasePrimaryTextCardView,
    IPrimaryTextCardParameters
  } from '@microsoft/sp-adaptive-card-extension-base';
  import { IWellbeingRequestsAdaptiveCardExtensionProps, IWellbeingRequestsAdaptiveCardExtensionState, QUICK_VIEW_REGISTRY_ID } from '../WellbeingRequestsAdaptiveCardExtension';
  
  export class SetupCardView extends BasePrimaryTextCardView<IWellbeingRequestsAdaptiveCardExtensionProps, IWellbeingRequestsAdaptiveCardExtensionState> {
  
    public get data(): IPrimaryTextCardParameters {
      return {
        primaryText: "Setup Required",
        description: "You must set the list name and teams app id"
      };
    }
  }