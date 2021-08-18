import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension, IImageCardParameters } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { CompanyNewsPropertyPane } from './CompanyNewsPropertyPane';
import { getSP } from "../../pnpjs";
import { CompanyArticle } from "./types";

export interface ICompanyNewsAdaptiveCardExtensionProps {
  title: string;
  description: string;
  iconProperty: string;
}

export interface ICompanyNewsAdaptiveCardExtensionState {
  articleIndex: number;
  articles: CompanyArticle[];
}

// we will have two views, a card view and a quick view to show the full article details and allow likes
const CARD_VIEW_REGISTRY_ID: string = 'CompanyNews_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'CompanyNews_QUICK_VIEW';

export default class CompanyNewsAdaptiveCardExtension extends BaseAdaptiveCardExtension<ICompanyNewsAdaptiveCardExtensionProps, ICompanyNewsAdaptiveCardExtensionState> {

  private _deferredPropertyPane: CompanyNewsPropertyPane | undefined;

  public async onInit(): Promise<void> {

    // set our initial state
    this.state = {
      articleIndex: -1,
      articles: [],
    };

    // register our views
    this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
    this.quickViewNavigator.register(QUICK_VIEW_REGISTRY_ID, () => new QuickView());

    // let the page get some breathing room and then make our initial data request
    setTimeout(async () => {

      const sp = getSP(this.context);

      const articles = await sp.web.getArticles();

      // update our state with the articles, which will re-render the views
      this.setState({
        articleIndex: 0,
        articles,
      });

    }, 300);
  }

  public get title(): string {

    return this.properties.title;
  }

  protected get iconProperty(): string {

    return this.properties.iconProperty || require('./assets/SharePointLogo.svg');
  }

  protected async loadPropertyPaneResources(): Promise<void> {

    const component = await import(
      /* webpackChunkName: 'CompanyNews-property-pane'*/
      './CompanyNewsPropertyPane'
    );

    this._deferredPropertyPane = new component.CompanyNewsPropertyPane();
  }

  protected renderCard(): string | undefined {

    return CARD_VIEW_REGISTRY_ID;
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {

    return this._deferredPropertyPane!.getPropertyPaneConfiguration();
  }
}
