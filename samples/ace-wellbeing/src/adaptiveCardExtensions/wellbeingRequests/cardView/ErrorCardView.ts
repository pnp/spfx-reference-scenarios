import {
    BasePrimaryTextCardView,
    IPrimaryTextCardParameters
} from '@microsoft/sp-adaptive-card-extension-base';

import { IWellbeingRequestsAdaptiveCardExtensionProps, IWellbeingRequestsAdaptiveCardExtensionState, QUICK_VIEW_REGISTRY_ID } from '../WellbeingRequestsAdaptiveCardExtension';

export class ErrorCardView extends BasePrimaryTextCardView<IWellbeingRequestsAdaptiveCardExtensionProps, IWellbeingRequestsAdaptiveCardExtensionState> {

    public get data(): IPrimaryTextCardParameters {
        return {
            title: "What have you done!?",
            primaryText: "Error",
            description: this.state.errorMessage,
            iconProperty: "Error"
        };
    }
}