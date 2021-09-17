import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments } from '@microsoft/sp-adaptive-card-extension-base';

import { IImageRotatorAdaptiveCardExtensionProps, IImageRotatorAdaptiveCardExtensionState } from '../ImageRotatorAdaptiveCardExtension';

import { Logger, LogLevel } from "@pnp/logging";

import { findIndex } from 'lodash';

export interface IQuickViewData {
  imgTitle: string;
  imgSrc: string;
  imgAltText: string;
  imgDescription: string;
}

export class QuickView extends BaseAdaptiveCardView<
  IImageRotatorAdaptiveCardExtensionProps,
  IImageRotatorAdaptiveCardExtensionState,
  IQuickViewData
> {
  private LOG_SOURCE: string = "🔶 QuickView";
  public get data(): IQuickViewData {
    let retVal: IQuickViewData = null;
    try {
      const image = this.state.images[this.state.currentImageId];
      if (image) {
        retVal = {
          imgTitle: image.title,
          imgSrc: image.imageSrc,
          imgAltText: image.altText,
          imgDescription: image.description
        };
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (data) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }

  public async onAction(action: IActionArguments): Promise<void> {
    if (action.type === 'Submit') {
      const { id, newIndex } = action.data;
      if (id === 'previous') {
        let idx = findIndex(this.state.images, { id: this.state.currentImageId });
        let newViewId: number = this.state.currentImageId;
        idx--;
        if (idx < 0) {
          newViewId = this.state.images[this.state.images.length - 1].id;
        } else {
          newViewId = this.state.images[idx].id;
        }
        this.setState({ currentImageId: newViewId });
      } else if (id === 'next') {
        let idx = findIndex(this.state.images, { id: this.state.currentImageId });
        let newViewId: number = this.state.currentImageId;
        idx++;
        if (idx < this.state.images.length) {
          newViewId = this.state.images[idx].id;
        } else {
          newViewId = this.state.images[0].id;
        }
        this.setState({ currentImageId: newViewId });
      }
    }
  }
}