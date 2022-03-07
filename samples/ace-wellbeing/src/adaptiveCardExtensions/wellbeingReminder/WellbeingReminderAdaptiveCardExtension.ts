import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { WellbeingReminderPropertyPane } from './WellbeingReminderPropertyPane';
import { SPHttpClient } from '@microsoft/sp-http';
import { isEmpty } from '@microsoft/sp-lodash-subset';
import { SetupCardView } from './cardView/SetupCardView';
import { ErrorCardView } from './cardView/ErrorCardView';


export interface IWellbeingReminderAdaptiveCardExtensionProps {
  title: string;
  description: string;
  iconProperty: string;
  wellbeingListName: string;
  maxWellbeingDays: number;
}

export interface IWellbeingReminderAdaptiveCardExtensionState {
  description: string;
  remainingWellbeingDays: number;
  errorMessage: string;
  cardViewToRender: string;
}

const CARD_VIEW_REGISTRY_ID: string = 'WellbeingReminder_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'WellbeingReminder_QUICK_VIEW';
const SETUP_CARD_VIEW_REGISTRY_ID: string = 'WellbeingRequests_SETUP_CARD_VIEW';
const ERROR_CARD_VIEW_REGISTRY_ID: string = 'WellbeingRequests_ERROR_CARD_VIEW';

export default class WellbeingReminderAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IWellbeingReminderAdaptiveCardExtensionProps,
  IWellbeingReminderAdaptiveCardExtensionState
> {
  private _deferredPropertyPane: WellbeingReminderPropertyPane | undefined;

  public async onInit(): Promise<void> {

    this.state = {
      description: this.properties.description,
      remainingWellbeingDays: null,
      errorMessage: "",
      cardViewToRender: CARD_VIEW_REGISTRY_ID
    };

    this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
    this.quickViewNavigator.register(QUICK_VIEW_REGISTRY_ID, () => new QuickView());
    this.cardNavigator.register(SETUP_CARD_VIEW_REGISTRY_ID, () => new SetupCardView());
    this.cardNavigator.register(ERROR_CARD_VIEW_REGISTRY_ID, () => new ErrorCardView());

    await this._loadDetails();
    return Promise.resolve();
  }

  private async _getCurrentUserId(): Promise<any> {
    const response = await this.context.spHttpClient
      .post(`${this.context.pageContext.web.absoluteUrl}/_api/web/ensureUser('${this.context.pageContext.user.loginName}')?$select=Id`, SPHttpClient.configurations.v1, {
        headers: {
          'content-type': 'application/json;odata.metadata=none',
          accept: 'application/json;odata.metadata=none'
        }
      });

    const user = await response.json();

    if (user.error) {
      return null;
    }

    return user.Id;
  }

  private async _getCurrentUsersWellbeingRequests(userId: number): Promise<any> {

    const response = await this.context.spHttpClient
      .get(`${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getByTitle('${this.properties.wellbeingListName}')/items?$filter=Status eq 'Requested' and EmployeeId eq ${userId}&$select=Id`, SPHttpClient.configurations.v1, {
        headers: {
          accept: 'application/json;odata.metadata=none'
        }
      });

    const currentUsersWellbeingRequests = await response.json();

    if (currentUsersWellbeingRequests.error) {
      return null;
    }

    return currentUsersWellbeingRequests.value;

  }

  private async _loadDetails(): Promise<any> {

    if (isEmpty(this.properties.wellbeingListName)) {
      this.setState({
        cardViewToRender: SETUP_CARD_VIEW_REGISTRY_ID
      });
      this.cardNavigator.replace(this.state.cardViewToRender);
      return;
    }

    let currentUserId = await this._getCurrentUserId();

    if (currentUserId === null) {
      this.setState({
        cardViewToRender: ERROR_CARD_VIEW_REGISTRY_ID,
        errorMessage: "Unable to get  user details"
      });
      this.cardNavigator.replace(this.state.cardViewToRender);
      return;
    }

    let currentUsersWellbeingRequests = await this._getCurrentUsersWellbeingRequests(currentUserId);

    if (currentUsersWellbeingRequests === null) {
      this.setState({
        cardViewToRender: ERROR_CARD_VIEW_REGISTRY_ID,
        errorMessage: "Please check if the list name is correct"
      });
      this.cardNavigator.replace(this.state.cardViewToRender);
      return;
    }

    const { maxWellbeingDays } = this.properties;
    const neededMaxWellbeingDays = maxWellbeingDays ? maxWellbeingDays : 5;

    this.setState({
      errorMessage: "",
      cardViewToRender: CARD_VIEW_REGISTRY_ID,
      remainingWellbeingDays: neededMaxWellbeingDays - currentUsersWellbeingRequests.length
    });

    this.cardNavigator.replace(this.state.cardViewToRender);
    return;

  }

  public get title(): string {
    return 'Wellbeing';
  }

  protected get iconProperty(): string {
    return require('./assets/Flower.svg');
  }

  protected loadPropertyPaneResources(): Promise<void> {
    return import(
      /* webpackChunkName: 'WellbeingReminder-property-pane'*/
      './WellbeingReminderPropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.WellbeingReminderPropertyPane();
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
