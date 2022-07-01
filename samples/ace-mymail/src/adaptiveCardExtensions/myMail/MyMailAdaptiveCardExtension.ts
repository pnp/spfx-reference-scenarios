import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';

import { sp } from "@pnp/sp";
import { graph } from "@pnp/graph";
import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";

import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { MyMailPropertyPane } from './MyMailPropertyPane';
import { IMyMailService, MyMailService } from './services/mymail.service';
import { Message } from './models/mymail.models';


export interface IMyMailAdaptiveCardExtensionProps {
  title: string;
  mailType: string;
  refreshRate: number;
  numToReturn: number;
}

export interface IMyMailAdaptiveCardExtensionState {
  messages: Message[];
}

const CARD_VIEW_REGISTRY_ID: string = 'MyMail_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'MyMail_QUICK_VIEW';

export default class MyMailAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IMyMailAdaptiveCardExtensionProps,
  IMyMailAdaptiveCardExtensionState
> {
  private _deferredPropertyPane: MyMailPropertyPane | undefined;
  private LOG_SOURCE: string = "🔶 MyMailAdaptiveCardExtension";

  public async onInit(): Promise<void> {

    try {
      this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
      this.quickViewNavigator.register(QUICK_VIEW_REGISTRY_ID, () => new QuickView());

      //Initialize PnPLogger
      Logger.subscribe(new ConsoleListener());
      Logger.activeLogLevel = LogLevel.Info;

      //Initialize PnPJs
      sp.setup({ spfxContext: this.context });
      graph.setup({ spfxContext: this.context });

      const myMailService = this.context.serviceScope.consume(MyMailService.serviceKey);
      const myMessages = await myMailService.getMyMail(this.properties.mailType, this.properties.numToReturn);


      this.state = {
        messages: myMessages,
      };
      this.refreshMail(myMailService, this.properties.refreshRate);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (onInit) - ${err.message} - `, LogLevel.Error);
    }

    return Promise.resolve();
  }

  private async refreshMail(mailService: IMyMailService, delay: number): Promise<any> {
    while (true) {
      const myMessages = await mailService.getMyMail(this.properties.mailType, this.properties.numToReturn);
      //We don't want to rerender if the count hasn't changed.
      if (myMessages.length != this.state.messages.length) {
        this.setState({ messages: myMessages });
      }
      await this.delay(delay * 60000);
    }
  }

  private async delay(ms: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected loadPropertyPaneResources(): Promise<void> {
    return import(
      /* webpackChunkName: 'MyMail-property-pane'*/
      './MyMailPropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.MyMailPropertyPane();
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
