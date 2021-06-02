import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';

import { sp } from "@pnp/sp";
import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";

import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { CovidCardPropertyPane } from './CovidCardPropertyPane';
import { cs } from '../../webparts/covidAdmin/services/covid.service';

export interface ICovidCardAdaptiveCardExtensionProps {
  title: string;
  description: string;
  iconProperty: string;
  homeSite: string;
}

export interface ICovidCardAdaptiveCardExtensionState {
  canCheckIn: boolean;
  userId: number;
  displayName: string;
}

const CARD_VIEW_REGISTRY_ID: string = 'CovidCard_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'CovidCard_QUICK_VIEW';

export default class CovidCardAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  ICovidCardAdaptiveCardExtensionProps,
  ICovidCardAdaptiveCardExtensionState
> {

  private LOG_SOURCE: string = "🔶CovidCardAdaptiveCardExtension";
  private _userId: number = 0;
  private _displayName: string = "";
  private _userCanCheckIn: boolean = false;

  private _deferredPropertyPane: CovidCardPropertyPane | undefined;

  public async onInit(): Promise<void> {
    try {
      if (this.properties.homeSite == undefined || this.properties.homeSite.length < 1) {
        this.properties.homeSite = this.context.pageContext.site.absoluteUrl;
      }

      this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
      this.quickViewNavigator.register(QUICK_VIEW_REGISTRY_ID, () => new QuickView());

      //Initialize PnPLogger
      Logger.subscribe(new ConsoleListener());
      Logger.activeLogLevel = LogLevel.Info;

      //Initialize PnPJs
      sp.setup({ spfxContext: this.context });


      this._userId = this.context.pageContext.legacyPageContext.userId;
      this._displayName = this.context.pageContext.legacyPageContext.userDisplayName;
      if (this._userId == undefined) {
        const user = await sp.web.ensureUser(this.context.pageContext.user.loginName);
        this._userId = user.data.Id;
      }
      this._userCanCheckIn = await cs.userCanCheckIn(this._userId, this.properties.homeSite);
      if (this._userCanCheckIn) {
        await cs.init(this.properties.homeSite, false, false);
      }

      this.state = {
        canCheckIn: this._userCanCheckIn,
        userId: this._userId,
        displayName: this._displayName
      };
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (onInit) - ${err.message} - `, LogLevel.Error);
    }

    return Promise.resolve();
  }

  // public get title(): string {
  //   return this.properties.title;
  // }

  protected get iconProperty(): string {
    return require('../../../teams/3ab8fb75-8f80-4ff1-90a3-6f711ad27c1d_color.png');
  }

  protected loadPropertyPaneResources(): Promise<void> {
    return import(
      /* webpackChunkName: 'CovidCard-property-pane'*/
      './CovidCardPropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.CovidCardPropertyPane();
        }
      );
  }

  protected renderCard(): string | undefined {
    return CARD_VIEW_REGISTRY_ID;
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return this._deferredPropertyPane!.getPropertyPaneConfiguration();
  }

  // tslint:disable-next-line: no-any
  // protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {
  //   this.setState({
  //     description: newValue
  //   });
  // }
}
