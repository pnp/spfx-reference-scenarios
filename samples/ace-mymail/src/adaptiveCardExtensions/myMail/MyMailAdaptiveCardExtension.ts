import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';

import { sp } from "@pnp/sp";
import { graph } from "@pnp/graph";
import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";

import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { MyMailPropertyPane } from './MyMailPropertyPane';
import { MyMailService } from './services/mymail.service';
import { Message } from './models/mymail.models';


export interface IMyMailAdaptiveCardExtensionProps {
  title: string;
  mailType: string;
  refreshRate: number;
}

export interface IMyMailAdaptiveCardExtensionState {
  messages: Message[];
  focusedMessages: string;
  otherMessages: string;
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
      const myMessages = await myMailService.getMyMail(this.properties.mailType);
      let focused: number = 0;
      myMessages.map((m) => {
        if (m.inferenceClassification == "focused") {
          focused++;
        }
      });

      this.state = {
        messages: myMessages,
        focusedMessages: focused.toString(),
        otherMessages: (myMessages.length - focused).toString()
      };
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (onInit) - ${err.message} - `, LogLevel.Error);
    }

    return Promise.resolve();
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
