import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { PageContext } from "@microsoft/sp-page-context";
import { AadTokenProviderFactory } from "@microsoft/sp-http";

import { graphfi, SPFx, GraphFI, GraphQueryableCollection } from "@pnp/graph";
import "@pnp/graph/users";
import "@pnp/graph/messages";

import { IMessage, MailType, Message } from "../models/mymail.models";
import { IMailFolder } from "@pnp/graph/messages";
import { IUser } from "@pnp/graph/users";

export interface IMyMailService {
  readonly ready: boolean;
  getMyMail: (filter: string, maxNumber: number) => Promise<Message[]>;
}

export class MyMailService implements IMyMailService {
  private LOG_SOURCE: string = "🔶 MyMailService";
  public static readonly serviceKey: ServiceKey<IMyMailService> =
    ServiceKey.create<MyMailService>("MyMailService:IMyMailService", MyMailService);
  private _pageContext: PageContext;
  private _ready: boolean = false;
  private _graph: GraphFI;
  private _styleArray: string[] = ['498205', '0b6a0b', '038387', '005b70', '4f6bed', '0078d4', '004e8c', '8764b8', '5c2e91', '881798', 'c239b3', 'e3008c', '750b1c', 'd13438', 'a4262c', 'ca5010', '8e562e', '986f0b', '7a7574', '69797e'];

  constructor() { }

  public Init(serviceScope: ServiceScope): void {
    serviceScope.whenFinished(() => {
      this._pageContext = serviceScope.consume(PageContext.serviceKey);
      const aadTokenProviderFactory = serviceScope.consume(AadTokenProviderFactory.serviceKey);
      this._graph = graphfi().using(SPFx({ pageContext: this._pageContext, aadTokenProviderFactory }));
      this._ready = true;
    });
  }

  public get ready(): boolean {
    return this._ready;
  }

  public async getMyMail(filter: string, maxNumber: number): Promise<Message[]> {
    let retVal: Message[] = [];
    let filterString: string = "receivedDateTime ge 2021-01-01 and isRead eq false";
    if (filter == MailType.focused) {
      filterString += " and inferenceClassification eq 'focused'";
    }
    else if (filter == MailType.other) {
      filterString += " and inferenceClassification eq 'other'";
    }

    try {
      const today: Date = new Date();
      const messagesQuery = GraphQueryableCollection(this._graph.me, "mailFolders/Inbox/messages");
      const messages: Message[] = await messagesQuery
        .select("id", "receivedDateTime", "subject", "importance", "isRead", "webLink", "inferenceClassification", "from")
        .filter(filterString)
        .orderBy('receivedDateTime', false)
        .top(maxNumber)();
      let currentUserDomain = this._pageContext.user.email.split("@")[1];
      messages.map((m) => {
        const recievedDate: Date = new Date(m.receivedDateTime);
        if (recievedDate.toLocaleDateString() == today.toLocaleDateString()) {
          m.isToday = true;
        } else {
          m.isToday = false;
        }

        let senderDomain = m.from.emailAddress.address.split("@")[1];
        if (currentUserDomain != senderDomain) {
          const min: number = Math.ceil(0);
          const max: number = Math.floor(this._styleArray.length - 1);
          const randStyle: number = Math.floor(Math.random() * (max - min) + min);
          let nameArray: string[] = m.from.emailAddress.name.split(" ");
          if (nameArray.length > 1) {
            m.from.emailAddress.initials = `${nameArray[0].charAt(0).toUpperCase()}${nameArray[nameArray.length - 1].charAt(0).toUpperCase()}`;
          } else {
            m.from.emailAddress.initials = nameArray[0].charAt(0).toUpperCase();
          }
          m.from.emailAddress.bgColor = this._styleArray[randStyle];
        } else {
          m.from.emailAddress.initials = '';
        }
      });
      retVal = messages;
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (getMyMail) - ${err.message} - `);
    }
    return retVal;
  }
}

export const myMailService = new MyMailService();