import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { DynamicCard2PropertyPane } from './DynamicCard2PropertyPane';

export interface IDynamicCard2AdaptiveCardExtensionProps {
  title: string;
  description: string;
  iconProperty: string;
}

export interface IDynamicCard2AdaptiveCardExtensionState {
  description: string;
  itemCount: number;
}

const CARD_VIEW_REGISTRY_ID: string = 'DynamicCard2_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'DynamicCard2_QUICK_VIEW';

export default class DynamicCard2AdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IDynamicCard2AdaptiveCardExtensionProps,
  IDynamicCard2AdaptiveCardExtensionState
> {
  private _deferredPropertyPane: DynamicCard2PropertyPane | undefined;

  public onInit(): Promise<void> {
    this.state = {
      description: this.properties.description,
      itemCount: 0,
    };

    this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
    this.quickViewNavigator.register(QUICK_VIEW_REGISTRY_ID, () => new QuickView());   
        
    const fixture = () => {

      this.setState({
        itemCount: this.state.itemCount + 1,
      });

      setTimeout(fixture, 3000);
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
      /* webpackChunkName: 'DynamicCard2-property-pane'*/
      './DynamicCard2PropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.DynamicCard2PropertyPane();
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
