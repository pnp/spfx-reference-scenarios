import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { DynamicCardPropertyPane } from './DynamicCardPropertyPane';

export interface IDynamicCardAdaptiveCardExtensionProps {
  title: string;
  description: string;
  iconProperty: string;
}

export interface IDynamicCardAdaptiveCardExtensionState {
  description: string;
  timerCounter: number;
}

const CARD_VIEW_REGISTRY_ID: string = 'DynamicCard_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'DynamicCard_QUICK_VIEW';

export default class DynamicCardAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IDynamicCardAdaptiveCardExtensionProps,
  IDynamicCardAdaptiveCardExtensionState
> {
  private _deferredPropertyPane: DynamicCardPropertyPane | undefined;

  public onInit(): Promise<void> {

    this.state = {
      description: this.properties.description,
      timerCounter: 0,
    };

    this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
    this.quickViewNavigator.register(QUICK_VIEW_REGISTRY_ID, () => new QuickView());

    const fixture = () => {

      this.setState({
        description: this.properties.description + this.state.timerCounter + 1,
        timerCounter: this.state.timerCounter + 1,
      });

      setTimeout(fixture, 5000);
    };

    fixture();

    return Promise.resolve();
  }

  public get title(): string {
    return this.properties.title;
  }

  protected get iconProperty(): string {
    return this.properties.iconProperty || require('./assets/SharePointLogo.svg');
  }

  protected loadPropertyPaneResources(): Promise<void> {
    return import(
      /* webpackChunkName: 'DynamicCard-property-pane'*/
      './DynamicCardPropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.DynamicCardPropertyPane();
        }
      );
  }

  protected renderCard(): string | undefined {
    return CARD_VIEW_REGISTRY_ID;
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return this._deferredPropertyPane!.getPropertyPaneConfiguration();
  }
}
