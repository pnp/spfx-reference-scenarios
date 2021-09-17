import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import { IWeatherAdaptiveCardExtensionProps, IWeatherAdaptiveCardExtensionState } from '../WeatherAdaptiveCardExtension';

import { Logger, LogLevel } from "@pnp/logging";

import { findIndex } from 'lodash';

export interface IQuickViewData {
  city: string;
  state: string;
  country: string;
  date: string;
  tempCurrent: number;
  tempHi: number;
  tempLow: number;
  tempMeasure: string;
}

export class QuickView extends BaseAdaptiveCardView<
  IWeatherAdaptiveCardExtensionProps,
  IWeatherAdaptiveCardExtensionState,
  IQuickViewData
> {
  private LOG_SOURCE: string = "🔶 QuickView";
  public get data(): IQuickViewData {
    let retVal: IQuickViewData = null;
    try {
      const location = this.state.locations[this.state.currentLocationId];
      const date = new Date();
      if (location) {
        retVal = {
          city: location.city,
          state: location.state,
          country: location.country,
          date: date.toUTCString(),
          tempHi: location.tempHi,
          tempLow: location.tempLow,
          tempMeasure: location.tempMeasure,
          tempCurrent: location.tempCurrent,
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
        let idx = findIndex(this.state.locations, { id: this.state.currentLocationId });
        let newViewId: number = this.state.currentLocationId;
        idx--;
        if (idx < 0) {
          newViewId = this.state.locations[this.state.locations.length - 1].id;
        } else {
          newViewId = this.state.locations[idx].id;
        }
        this.setState({ currentLocationId: newViewId });
      } else if (id === 'next') {
        let idx = findIndex(this.state.locations, { id: this.state.currentLocationId });
        let newViewId: number = this.state.currentLocationId;
        idx++;
        if (idx < this.state.locations.length) {
          newViewId = this.state.locations[idx].id;
        } else {
          newViewId = this.state.locations[0].id;
        }
        this.setState({ currentLocationId: newViewId });
      }
    }
  }
}