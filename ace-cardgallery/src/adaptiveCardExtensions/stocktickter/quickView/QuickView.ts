import { ISPFxAdaptiveCard, BaseAdaptiveCardView } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'StocktickterAdaptiveCardExtensionStrings';
import { IStocktickterAdaptiveCardExtensionProps, IStocktickterAdaptiveCardExtensionState } from '../StocktickterAdaptiveCardExtension';

export interface IQuickViewData {
  id: number;
  symbol: string;
  companyName: string;
  primaryExchange: string;
  latestUpdate: string;
  latestPrice: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
}

export class QuickView extends BaseAdaptiveCardView<
  IStocktickterAdaptiveCardExtensionProps,
  IStocktickterAdaptiveCardExtensionState,
  IQuickViewData
> {
  public get data(): IQuickViewData {
    const { stock } = this.state;
    return {
      id: stock.id,
      symbol: stock.symbol,
      companyName: stock.companyName,
      primaryExchange: stock.primaryExchange,
      latestUpdate: stock.latestUpdate,
      latestPrice: stock.latestPrice,
      change: stock.change,
      changePercent: stock.changePercent,
      open: stock.open,
      high: stock.high,
      low: stock.low,
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }
}