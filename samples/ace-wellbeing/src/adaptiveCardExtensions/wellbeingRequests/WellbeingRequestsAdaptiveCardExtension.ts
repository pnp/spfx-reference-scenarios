import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { WellbeingRequestsPropertyPane } from './WellbeingRequestsPropertyPane';
import { SPHttpClient } from '@microsoft/sp-http';
import { isEmpty } from '@microsoft/sp-lodash-subset';
import { SetupCardView } from './cardView/SetupCardView';
import { ErrorCardView } from './cardView/ErrorCardView';

export interface IWellbeingRequestsAdaptiveCardExtensionProps {
  title: string;
  description: string;
  iconProperty: string;
  wellbeingListName: string;
  wellbeingTeamsAppId: string;
}

export interface IWellbeingRequest {
  id: string;
  employeeName: string;
  employeePhoto: string;
  date: string;
  teamsUrl: string;
  iconSvg: string;
}

export interface IWellbeingRequestsAdaptiveCardExtensionState {
  requests: IWellbeingRequest[];
  errorMessage: string;
  cardViewToRender: string;
}

const CARD_VIEW_REGISTRY_ID: string = 'WellbeingRequests_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'WellbeingRequests_QUICK_VIEW';
const SETUP_CARD_VIEW_REGISTRY_ID: string = 'WellbeingRequests_SETUP_CARD_VIEW';
const ERROR_CARD_VIEW_REGISTRY_ID: string = 'WellbeingRequests_ERROR_CARD_VIEW';

export default class WellbeingRequestsAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IWellbeingRequestsAdaptiveCardExtensionProps,
  IWellbeingRequestsAdaptiveCardExtensionState
> {
  private _deferredPropertyPane: WellbeingRequestsPropertyPane | undefined;

  public async onInit(): Promise<void> {


    this.state = {
      requests: [],
      errorMessage: "",
      cardViewToRender: CARD_VIEW_REGISTRY_ID
    };

    this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
    this.quickViewNavigator.register(QUICK_VIEW_REGISTRY_ID, () => new QuickView());
    this.cardNavigator.register(SETUP_CARD_VIEW_REGISTRY_ID, () => new SetupCardView());
    this.cardNavigator.register(ERROR_CARD_VIEW_REGISTRY_ID, () => new ErrorCardView());

    this._loadDetails();

  }

  private async _getWellbeingRequests(): Promise<any> {
    const response = await this.context.spHttpClient
      .get(`${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getByTitle('${this.properties.wellbeingListName}')/items?$filter=Status eq 'Requested'&$select=Id,EmployeeId,Date`, SPHttpClient.configurations.v1, {
        headers: {
          accept: 'application/json;odata.metadata=none'
        }
      });

    const wellbeingRequests = await response.json();

    if (wellbeingRequests.error) {
      return null;
    }

    return wellbeingRequests.value;
  }

  private async _getWellbeingUsers(wellbeingRequests: any): Promise<any> {
    const uniqueUserIds = Array.from(new Set(wellbeingRequests.map(r => r.EmployeeId)));
    const userPromises = uniqueUserIds.map(userId => {
      return this.context.spHttpClient
        .get(`${this.context.pageContext.web.absoluteUrl}/_api/web/siteUsers/getById(${userId})?$select=Id,Title,UserPrincipalName`, SPHttpClient.configurations.v1, {
          headers: {
            accept: 'application/json;odata.metadata=none'
          }
        });
    });

    const usersPromisesResponse = await Promise.all(userPromises);
    const users = await Promise.all(usersPromisesResponse.map(u => { return (u as any).json(); }));

    return users;
  }

  private async _loadDetails(): Promise<void> {

    if (isEmpty(this.properties.wellbeingListName) || isEmpty(this.properties.wellbeingTeamsAppId)) {
      this.setState({
        cardViewToRender: SETUP_CARD_VIEW_REGISTRY_ID
      });
      this.cardNavigator.replace(this.state.cardViewToRender);
      return;
    }

    const wellbeingRequests = await this._getWellbeingRequests();

    if (wellbeingRequests === null) {
      this.setState({
        cardViewToRender: ERROR_CARD_VIEW_REGISTRY_ID,
        errorMessage: "Please check if the list name is correct"
      });
      this.cardNavigator.replace(this.state.cardViewToRender);
      return;
    }

    const wellbeingUsers = await this._getWellbeingUsers(wellbeingRequests);
    let teamsUrlFirstPart: string = `https://teams.microsoft.com/l/entity/${this.properties.wellbeingTeamsAppId}/0`;
    // let iconSvg: string = require('./assets/view.svg');
    let iconSvg: string = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAE2ElEQVRoge2YQWiUVxSFv/MjgwQJQYbBhUjQGkKwuy6KhCA0Bt1UqiJUEaxb0dKtC3dddSFSxJXtIlBBGkt2GnVhEGnRXaqGpkoQFyEEESkiQe7p4r+RUZPJTBIFYc5mmJl37n/u+9+779wHbbTRRhtttPEJQ6sh2y6ALqAKbAX6gG22uyVtBCo5bh54BkxLegQ8AB4Dc8BzSfFRE7C9LgUPAJ8Dfba3SJoH5mzPSnoBzCdlve0Nkmq2q5IqwJNMZAIYBx5Lev3BE7DdC3wLfAFsyZ//tn1T0mQm8BKYrxO0jvJtdGQCvcBXwI78/wlwD7iUMdY2AdsVoNf2AUkHgZfANDAK3ABmpNbmIiKQtAkYBPYB3UAH8DswYnuyKIr5BiGaS8B2F3A4H7IZGLd9XdJtSbMtqV76GTXb/ZJ2Uy7Lp7ZHJf0m6fmKErAN0AucyKBzwK/AGDDXaOPZriZ3k20kzeSMzjXgFLm8hoDvKAvDOHA+uc0nYHs98DVwknID/gH8UhTFTAMBncCXwAFgwHbkpsZ2RVKRgkaAP3OTL4qI2AQcl/QN8Mr2eUlXFuI1TCCFHARO2J6TNGz7cqP1aLsGfA8MAQHcAaYo3xo5s9uB/nwjY8BZSY3eSAU4BBy1XZN0DrjSKHFsb7B9yvZd26O2d2agRpyq7Z9s37c9bHvAdleeEQtjivxtIMfcT051mdiViNgZEaOp6VREbFhq8HrbZyJiIiIuLRc8OZ22f0xBp/PtNUREdObY+8ldlmO7mpombJ/JJf52praP5YCLEdGzXNDkDeXMDDcjpI7XGRHDEXHX9lCTnB7bF1PjsYioLPyB7UHbtyJiNCJ21L/+ZYJesP2X7YFmxddxdyX3QpPji4jYkRpvRcRgREBEfGZ7JGejrwUBVdsPbZ/Ns6LVBLqS+7CZ5VrH60utIxHRU2Td7QGGJT1oQUNvfk4BS1eGpfECmLIddbGWhaQHkoaBHkmDBbDX9jRwtUUBNeAV8GwlbjI5z7K211qkX6W0MnuLnIEVIU/rVWGVMaKQdE1SN7CnRfIspcPc2Oymr0dyNqa1bslT2d5Daf6uFcAN2/8CR1rcxJNpD7YDTZfQOnQmt7DdtIW23SfpSGq+sRZl9O5KymhE7Epu02XU9o50CLdsl2U0g634IMuSNhwRLR9kmcDqDrK6AR15TE/Y/mBWIjmnI6IlK2H7UkQsWImOpQa+MXNpoNbUzEXEQFqIps1cahhNTe+ZuffsdER0StpPaY9ngWHg8mJevD4J4AfbQ1nf79iekjTn0j5XKTdsf1LGbJ9t1OBEREXSIdtHgZqkc7avFEXx1qG5VENTsb1f0glW2NBQ9gULSVeAlhoaSceB1huaOkFQWoyT1LWUtsckNdtS1mwXkmaAyWUamKVayp9t/9NSS1mPiOiSdNj2PkmbbY9Lum77dlEUa9LUR0RNUr/t3ZIGbD+VNAqsvKl/5wEVoFfSAcp286Xt6XzIqq9VcnK6bXdIWttrlXdhuwc4wjsXW8BNYNL2HOW90byk17kU10mqpMCF5fXWxZbte5I+zMXWIkm8d7WYycxT7pVZ2/9JepXjK0CnpBpQze9vrhYlfbyrxXcSKWx35axuTS+1DVj0clfStO1H2XesyeVuG2200UYbbXzS+B9EPGj0AVYDhgAAAABJRU5ErkJggg==";

    this.setState({
      requests: wellbeingRequests?.map(r => {
        return {
          id: r.Id,
          employeeName: (wellbeingUsers as any).find(u => u.Id === r.EmployeeId).Title,
          employeePhoto: `${this.context.pageContext.web.absoluteUrl}/_layouts/15/userphoto.aspx?size=L&accountname=${(wellbeingUsers as any).find(u => u.Id === r.EmployeeId).UserPrincipalName}`,
          date: r.Date,
          teamsUrl: `${teamsUrlFirstPart}?context=%7B%22subEntityId%22:%20%22${r.Id}%22%7D`,
          iconSvg
        };
      }),
      errorMessage: "",
      cardViewToRender: CARD_VIEW_REGISTRY_ID
    });

  }

  public get title(): string {
    return 'Wellbeing requests';
  }

  protected get iconProperty(): string {
    return require('./assets/InboxCheck.svg');
  }

  protected loadPropertyPaneResources(): Promise<void> {
    return import(
      /* webpackChunkName: 'WellbeingRequests-property-pane'*/
      './WellbeingRequestsPropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.WellbeingRequestsPropertyPane();
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
