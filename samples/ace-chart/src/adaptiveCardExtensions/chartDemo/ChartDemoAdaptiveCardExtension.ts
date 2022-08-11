import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { ChartDemoPropertyPane } from './ChartDemoPropertyPane';

export interface IChartDemoAdaptiveCardExtensionProps {
  title: string;
}

export interface IChartDemoAdaptiveCardExtensionState {
}

const CARD_VIEW_REGISTRY_ID: string = 'ChartDemo_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'ChartDemo_QUICK_VIEW';

export default class ChartDemoAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IChartDemoAdaptiveCardExtensionProps,
  IChartDemoAdaptiveCardExtensionState
> {
  private _deferredPropertyPane: ChartDemoPropertyPane | undefined;

  public onInit(): Promise<void> {
    this.state = { };

    this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
    this.quickViewNavigator.register(QUICK_VIEW_REGISTRY_ID, () => new QuickView());

    return Promise.resolve();
  }

  protected loadPropertyPaneResources(): Promise<void> {
    return import(
      /* webpackChunkName: 'ChartDemo-property-pane'*/
      './ChartDemoPropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.ChartDemoPropertyPane();
        }
      );
  }

  protected renderCard(): string | undefined {
    return CARD_VIEW_REGISTRY_ID;
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return this._deferredPropertyPane?.getPropertyPaneConfiguration();
  }
}
