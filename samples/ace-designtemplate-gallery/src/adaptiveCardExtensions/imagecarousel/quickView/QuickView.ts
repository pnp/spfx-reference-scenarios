import { ISPFxAdaptiveCard, BaseAdaptiveCardView, ISubmitActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'ImagecarouselAdaptiveCardExtensionStrings';

import { Logger, LogLevel } from "@pnp/logging";

import { ImageCarousel } from '../../../common/models/designtemplate.models';
import { IImagecarouselAdaptiveCardExtensionProps, IImagecarouselAdaptiveCardExtensionState } from '../ImagecarouselAdaptiveCardExtension';


export interface IQuickViewData {
  app: ImageCarousel;
  strings: IImagecarouselAdaptiveCardExtensionStrings;
  currentImage: number;
  nextIndex: number;
  nextArrow: string;
}

export class QuickView extends BaseAdaptiveCardView<
  IImagecarouselAdaptiveCardExtensionProps,
  IImagecarouselAdaptiveCardExtensionState,
  IQuickViewData
> {

  private LOG_SOURCE: string = "🔶 Image Carousel Quick View";

  public get data(): IQuickViewData {
    let arrow: string = require('../../../common/images/image-carousel/chevron_right_white.png');
    return {
      app: this.state.app,
      strings: strings,
      currentImage: this.state.currentImage,
      nextIndex: this.state.nextIndex,
      nextArrow: arrow
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }

  public async onAction(action: ISubmitActionArguments): Promise<void> {
    try {
      if (action.type === 'Submit') {
        const { id } = action.data;
        if (id === 'next') {
          let nextIndex = this.state.nextIndex + 1;
          if (nextIndex > this.data.app.images.length - 1) {
            nextIndex = 1;
          }
          let newIndex = this.state.currentImage + 1;
          if (newIndex >= this.data.app.images.length - 1) {
            newIndex = 0;
          }

          this.setState({ currentImage: newIndex, nextIndex: nextIndex });
        }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (onAction) - ${err}`, LogLevel.Error);
    }
  }
}