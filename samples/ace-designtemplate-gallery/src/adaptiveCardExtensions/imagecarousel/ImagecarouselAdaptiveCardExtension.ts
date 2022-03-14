import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { ImagecarouselPropertyPane } from './ImagecarouselPropertyPane';

import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";

import { dtg } from '../../common/services/designtemplate.service';
import { ImageCarousel } from '../../common/models/designtemplate.models';

export interface IImagecarouselAdaptiveCardExtensionProps {
  title: string;
  cardHeading: string;
  iconProperty: string;
  description: string;

}

export interface IImagecarouselAdaptiveCardExtensionState {
  app: ImageCarousel;
  currentImage: number;
  nextIndex: number;
}

const CARD_VIEW_REGISTRY_ID: string = 'Imagecarousel_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'Imagecarousel_QUICK_VIEW';

export default class ImagecarouselAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IImagecarouselAdaptiveCardExtensionProps,
  IImagecarouselAdaptiveCardExtensionState
> {
  private LOG_SOURCE: string = "🔶 Image Carousel Adaptive Card Extension";
  private _deferredPropertyPane: ImagecarouselPropertyPane | undefined;

  public onInit(): Promise<void> {
    try {
      //Initialize PnPLogger
      Logger.subscribe(new ConsoleListener());
      Logger.activeLogLevel = LogLevel.Info;

      //Initialize Service
      dtg.Init();

      //Get the data for the app
      const app: ImageCarousel = dtg.GetImageCarousel();

      //Set the data into state
      this.state = {
        app: app,
        currentImage: 0,
        nextIndex: 1
      };
      //Register the cards
      this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
      this.quickViewNavigator.register(QUICK_VIEW_REGISTRY_ID, () => new QuickView());
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (onInit) - ${err}`, LogLevel.Error);
    }
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
      /* webpackChunkName: 'Imagecarousel-property-pane'*/
      './ImagecarouselPropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.ImagecarouselPropertyPane();
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
