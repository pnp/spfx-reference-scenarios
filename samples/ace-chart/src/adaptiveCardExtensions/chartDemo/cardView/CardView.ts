import {
  BaseImageCardView,
  IImageCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction,
  ICardButton
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'ChartDemoAdaptiveCardExtensionStrings';
import { IChartDemoAdaptiveCardExtensionProps, IChartDemoAdaptiveCardExtensionState, QUICK_VIEW_REGISTRY_ID } from '../ChartDemoAdaptiveCardExtension';

import svgToTinyDataUri from "mini-svg-data-uri"

export class CardView extends BaseImageCardView<IChartDemoAdaptiveCardExtensionProps, IChartDemoAdaptiveCardExtensionState> {

  /**
   * Buttons will not be visible if card size is 'Medium' with Image Card View.
   * It will support up to two buttons for 'Large' card size.
   */
  public get cardButtons(): [ICardButton] | [ICardButton, ICardButton] | undefined {

    return [
      {
        title: strings.QuickViewButton,
        action: {
          type: 'QuickView',
          parameters: {
            view: QUICK_VIEW_REGISTRY_ID
          }
        }
      }
    ];
  }

  public get data(): IImageCardParameters {

    return {
      primaryText: strings.PrimaryText,
      imageUrl: getSVG(),
      title: this.properties.title
    };
  }

  public get onCardSelection(): IQuickViewCardAction | IExternalLinkCardAction | undefined {
    return {
      type: 'ExternalLink',
      parameters: {
        target: 'https://www.bing.com'
      }
    };
  }
}

// this shows how you could create dynamic SVGs for use in the card view. By using the "mini-svg-data-uri" library we can convert SVG markup into an image URL
// which we can supply to the imageUrl property of the card view above.
function getSVG(): string {

  return svgToTinyDataUri(`<svg xmlns='http://www.w3.org/2000/svg' width="22" height="22" viewBox="0 0 6 20">
    <g transform='translate(0,0)'>
        <rect width='4' height='3'></rect>
        <text x='47' y='9.5' dy='.35em'>5</text>
    </g>
    <g transform='translate(0,3)'>
        <rect width='8' height='3'></rect>
        <text x='97' y='9.5' dy='.35em'>10</text>
    </g>
    <g transform='translate(0,6)'>
        <rect width='41' height='3'></rect>
        <text x='117' y='9.5' dy='.35em'>12</text>
    </g>
  </svg>`);
}


