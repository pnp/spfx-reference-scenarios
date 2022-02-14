import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { PayslipPropertyPane } from './PayslipPropertyPane';

import { sp } from "@pnp/sp";
import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";

import { dtg } from '../../common/services/designtemplate.service';
import { PayPeriod, Payslip } from '../../common/models/designtemplate.models';
import * as strings from 'PayslipAdaptiveCardExtensionStrings';

export interface IPayslipAdaptiveCardExtensionProps {
  iconProperty: string;
}

export interface IPayslipAdaptiveCardExtensionState {
  payslips: Payslip[];
  payPeriods: PayPeriod[];
  currentPayPeriod: number;
}

const CARD_VIEW_REGISTRY_ID: string = 'Payslip_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'Payslip_QUICK_VIEW';

export default class PayslipAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IPayslipAdaptiveCardExtensionProps,
  IPayslipAdaptiveCardExtensionState
> {
  private LOG_SOURCE: string = "🔶 Payslip Adaptive Card Extension";
  private _deferredPropertyPane: PayslipPropertyPane | undefined;

  public onInit(): Promise<void> {
    try {
      //Initialize PnPLogger
      Logger.subscribe(new ConsoleListener());
      Logger.activeLogLevel = LogLevel.Info;

      //Initialize PnPJs
      sp.setup({ spfxContext: this.context });

      //Initialize Service
      dtg.Init();

      //Get the data for the app
      const payPeriods: PayPeriod[] = dtg.GetPayPeriods();
      const payslips: Payslip[] = dtg.GetPaySlips();

      //Set the data into state
      this.state = {
        payPeriods: payPeriods,
        payslips: payslips,
        currentPayPeriod: 0
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
    return strings.Title;
  }

  protected get iconProperty(): string {
    return this.properties.iconProperty || require('./assets/SharePointLogo.svg');
  }

  protected loadPropertyPaneResources(): Promise<void> {
    return import(
      /* webpackChunkName: 'Payslip-property-pane'*/
      './PayslipPropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.PayslipPropertyPane();
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
