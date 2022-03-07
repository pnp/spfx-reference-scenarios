import {
    BasePrimaryTextCardView,
    IPrimaryTextCardParameters
} from '@microsoft/sp-adaptive-card-extension-base';

import { IWellbeingReminderAdaptiveCardExtensionProps, IWellbeingReminderAdaptiveCardExtensionState } from '../WellbeingReminderAdaptiveCardExtension';

export class ErrorCardView extends BasePrimaryTextCardView<IWellbeingReminderAdaptiveCardExtensionProps, IWellbeingReminderAdaptiveCardExtensionState> {

    public get data(): IPrimaryTextCardParameters {
        return {
            title: "What have you done!?",
            primaryText: "Error",
            description: this.state.errorMessage,
            iconProperty: "Error"
        };
    }
}