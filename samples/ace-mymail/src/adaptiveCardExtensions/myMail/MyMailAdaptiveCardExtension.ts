import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';

import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { MyMailPropertyPane } from './MyMailPropertyPane';
import { myMailService } from './services/mymail.service';
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
  private _waiting;
  private _calls: number = 0;

  public async onInit(): Promise<void> {

    try {
      this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
      this.quickViewNavigator.register(QUICK_VIEW_REGISTRY_ID, () => new QuickView());

      this.state = {
        messages: [],
      };


      myMailService.Init(this.context.serviceScope);
      this._firstLoad();

    } catch (err) {
      console.error(`${this.LOG_SOURCE} (onInit) - ${err.message} - `);
    }

    return Promise.resolve();
  }

  private async _firstLoad(): Promise<void> {
    try {
      //Re-render when ready or calls > 1000
      const checkRender = async () => {
        if (myMailService.ready || this._calls > 600) {
          stop();
          this.refreshMail();
        } else {
          this._calls++;
        }
      };

      const stop = () => {
        clearInterval(this._waiting);
      };

      this._waiting = setInterval(checkRender, 100);
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (_firstLoad) ${err}`);
    }
  }

  private async refreshMail(): Promise<any> {
    while (true) {
      const myMessages = await myMailService.getMyMail(this.properties.mailType, this.properties.numToReturn);
      //We don't want to rerender if the count hasn't changed.
      if (myMessages.length != this.state.messages.length) {
        this.setState({ messages: myMessages });
      }
      await this.delay(this.properties.refreshRate * 60000);
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
