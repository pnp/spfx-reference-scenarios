import {
    BasePrimaryTextCardView,
    IPrimaryTextCardParameters
  } from '@microsoft/sp-adaptive-card-extension-base';
  import { IWellbeingReminderAdaptiveCardExtensionProps, IWellbeingReminderAdaptiveCardExtensionState } from '../WellbeingReminderAdaptiveCardExtension';
  
  export class SetupCardView extends BasePrimaryTextCardView<IWellbeingReminderAdaptiveCardExtensionProps, IWellbeingReminderAdaptiveCardExtensionState> {
  
    public get data(): IPrimaryTextCardParameters {
      return {
        primaryText: "Setup Required",
        description: "You must set the list name and the max number of well being days"
      };
    }
  }