import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { PageContext } from "@microsoft/sp-page-context";

import { graph } from "@pnp/graph";
import "@pnp/graph/users";
import "@pnp/graph/messages";

import { Logger, LogLevel } from "@pnp/logging";
import { MailType, Message } from "../models/mymail.models";

export interface IMyMailService {
  Init: (serviceScope: ServiceScope) => void;
  getMyMail: (filter: string) => Promise<Message[]>;
}

export class MyMailService implements IMyMailService {
  private LOG_SOURCE: string = "🔶 MyMailService";
  public static readonly serviceKey: ServiceKey<IMyMailService> =
    ServiceKey.create<MyMailService>("MyMailService:IMyMailService", MyMailService);
  private _ready: boolean = false;
  private _serviceScope: ServiceScope;
  private _pageContext: PageContext;

  constructor() { }

  public Init(serviceScope: ServiceScope): void {
    serviceScope.whenFinished(() => {
      this._serviceScope = serviceScope;
      this._pageContext = serviceScope.consume(PageContext.serviceKey);
      this._ready = true;
    });
  }

  public get ready(): boolean {
    return this._ready;
  }

  public async getMyMail(filter: string): Promise<Message[]> {
    let retVal: Message[] = [];
    let filterString: string = "isRead eq true";
    if (filter == MailType.focused) {
      filterString += " and inferenceClassification eq 'focused'";
    }
    else if (filter == MailType.other) {
      filterString += " and inferenceClassification eq 'other'";
    }

    try {
      const messages = await graph.me.messages
        .select("id,receivedDateTime,subject,importance,isRead,webLink,inferenceClassification,from")
        .filter(filterString)
        .get<{ id: string, receivedDateTime: string, subject: string, importance: string, isRead: boolean, webLink: string, inferenceClassification: string, from: { emailAddress: { name: string, address: string } } }[]>();
      retVal = messages;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (getMyMail) - ${err.message} - `, LogLevel.Error);
    }
    return retVal;
  }

}

export const serviceConst = new MyMailService();