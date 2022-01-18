import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { StateSamplePropertyPane } from './StateSamplePropertyPane';
import { getSP } from "../../pnpjs";

export interface IStateSampleAdaptiveCardExtensionProps {
  title: string;
  description: string;
  iconProperty: string;
}

// define each item's props in state
export interface IStateSampleItem {
  Id: number,
  Title: string,
  Details?: string,
}

// define the shape of our state
export interface IStateSampleAdaptiveCardExtensionState {
  activeIndex: number,
  items: IStateSampleItem[];
}

const CARD_VIEW_REGISTRY_ID: string = 'StateSample_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'StateSample_QUICK_VIEW';

export default class StateSampleAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IStateSampleAdaptiveCardExtensionProps,
  IStateSampleAdaptiveCardExtensionState
> {
  private _deferredPropertyPane: StateSamplePropertyPane | undefined;

  public onInit(): Promise<void> {

    // establish an initial state, with an update async to ensure we are responsive in the UI
    this.state = {
      activeIndex: -1,
      items: [],
    };

    setTimeout(async () => {

      // establish our sp instance, this will set it shared across this ACE so we can get it without a context later
      const sp = getSP(this.context);

      // ensure we have our list, must have permissions, better done as a provisioning step in production
      await sp.web.ensureDataList();

      // use our extension method to get some items
      const items = await sp.web.getItems();

      // update our initial state with the items only including title
      this.setState({
        activeIndex: items.length > 0 ? 0 : -1,
        items,
      });

      // delay here is just to illustrate state updating async followed by UI update flow, same pattern works with zero
    }, 3000);

    this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
    this.quickViewNavigator.register(QUICK_VIEW_REGISTRY_ID, () => new QuickView());

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
      /* webpackChunkName: 'StateSample-property-pane'*/
      './StateSamplePropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.StateSamplePropertyPane();
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
