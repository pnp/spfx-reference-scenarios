import { Providers, SharePointProvider } from '@microsoft/mgt';
import {
  IReadonlyTheme,
  ITheme, ThemeChangedEventArgs, ThemeProvider
} from '@microsoft/sp-component-base';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPHttpClient } from '@microsoft/sp-http';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { find } from '@microsoft/sp-lodash-subset';
import { MSGraph } from './services/msgraph';
import * as strings from 'WellbeingRequestReviewWebPartStrings';
import { IWellbeingRequestReviewProps } from './components/IWellbeingRequestReviewProps';
import WellbeingRequestReview from './components/WellbeingRequestReview';

export interface IWellbeingRequestReviewWebPartProps {
  description: string;
}

export default class WellbeingRequestReviewWebPart extends BaseClientSideWebPart<IWellbeingRequestReviewWebPartProps> {

  private _themeProvider: ThemeProvider;
  private _themeVariant: IReadonlyTheme | undefined;
  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';
  private _hasTeamsContext: boolean = false;
  private _homeSiteUrl: string = '';
  private _homeSiteId: string = '';
  private _homeSiteWebId: string = '';
  private _hostName: string = '';
  private _wellbeingDocumentsDriveName: string = '';
  private _wellbeingDocumentsDriveId: string = '';
  private _wellbeingRequestsListName: string = '';
  private _wellbeingGroupMailAddress: string = '';
  private _error: boolean = false;
  private _errorMessage: string = '';

  private requestId: string | undefined;

  protected async onInit(): Promise<void> {
    if (!Providers.globalProvider) {
      Providers.globalProvider = new SharePointProvider(this.context);
    }

    await MSGraph.Init(this.context);

    await this._getHomeSite();

    if (!this._error)
      await this._getConfigListItems();
    
    if(!this._error)
      await this._getWellbeingDriveId();

    this._hasTeamsContext = !!this.context.sdks.microsoftTeams;

    if (this._hasTeamsContext) {
      // handling MS Teams theme
      const teamsTheme = this.context.sdks.microsoftTeams.context.theme;
      this._updateTheme(teamsTheme);

      this.context.sdks.microsoftTeams.teamsJs.registerOnThemeChangeHandler(this._handleTeamsThemeChangedEvent);

      this.requestId = this.context.sdks.microsoftTeams.context.subEntityId;
    }
    else {
      // Consume the new ThemeProvider service
      this._themeProvider = this.context.serviceScope.consume(ThemeProvider.serviceKey);

      // If it exists, get the theme variant
      this._themeVariant = this._themeProvider.tryGetTheme();
      this._updateTheme(this._themeVariant);

      // Register a handler to be notified if the theme variant changes
      this._themeProvider.themeChangedEvent.add(this, this._handleSPThemeChangedEvent);

      const searchParams = new URLSearchParams(window.location.search);
      this.requestId = searchParams.get('requestId');
    }

    this._environmentMessage = this._getEnvironmentMessage();

    return super.onInit();
  }

  public render(): void {

    const element: React.ReactElement<IWellbeingRequestReviewProps> = React.createElement(
      WellbeingRequestReview,
      {
        isDarkTheme: this._isDarkTheme,
        hasTeamsContext: this._hasTeamsContext,
        requestId: this.requestId,
        spHttpClient: this.context.spHttpClient,
        webUrl: this._homeSiteUrl,
        wellbeingRequestsListName: this._wellbeingRequestsListName,
        wellbeingGroupMailAddress: this._wellbeingGroupMailAddress,
        isNarrow: this.width < 500,
        fileListQuery: `/sites/${this._hostName},${this._homeSiteId},${this._homeSiteWebId}/drives/${this._wellbeingDocumentsDriveId}/root/children`,
        error: this._error,
        errorMessage: this._errorMessage
      }
    );

    ReactDom.render(element, this.domElement);
  }

  /**
   * Update the current theme variant reference and re-render.
   *
   * @param args The new theme
   */
  private _handleSPThemeChangedEvent = (args: ThemeChangedEventArgs): void => {
    this._themeVariant = args.theme;
    this._updateTheme(this._themeVariant);
    this.render();
  }

  /**
   * Handle Teams theme change callback.
   *
   * @param args The new theme
   */
  private _handleTeamsThemeChangedEvent = (theme: string): void => {
    this._updateTheme(theme);
    this.render();
  }

  /**
   * Updates fields based on the new theme
   * @param currentTheme updated theme
   */
  private _updateTheme = (currentTheme: IReadonlyTheme | string) => {
    this._setIsDarkTheme(currentTheme);
    this._setCSSVariables();
  }

  /**
   * Updates the _isDarkTheme based on current SharePoint or Teams theme
   */
  private _setIsDarkTheme = (currentTheme: IReadonlyTheme | string) => {
    if (typeof currentTheme === 'string') { // Teams theme
      this._isDarkTheme = currentTheme !== 'default'; // contrast theme is interpreted as dark
    }
    else { // SharePoint theme
      const theme = currentTheme as ITheme;
      this._isDarkTheme = !!theme && !!theme.isInverted;
    }
  }

  private _setCSSVariables = () => {
    let primaryText = '#323130'; // default
    let linkText = '#03787c';
    if (this._themeVariant) {
      const {
        semanticColors
      } = this._themeVariant;
      primaryText = semanticColors.bodyText;
      linkText = semanticColors.link;
    }
    else if (this._hasTeamsContext) { // fallback for Teams
      primaryText = this._isDarkTheme ? '#FFFFFF' : '#242424';
      linkText = this._isDarkTheme ? '#FFFFFF' : '#494B83';
    }
    else { // fallback for single app page
      primaryText = this._isDarkTheme ? '#3a96dd' : '#323130';
      linkText = this._isDarkTheme ? '#3a96dd' : '#03787c';
    }

    this.domElement.style.setProperty('--primaryText', primaryText);
    this.domElement.style.setProperty('--linkText', linkText);
  }

  private _getEnvironmentMessage = (): string => {
    // checking for local environment
    let isLocal: boolean = false;
    /* const {
      loaderConfig
    } = this.manifest;

    if (loaderConfig && loaderConfig.internalModuleBaseUrls && loaderConfig.internalModuleBaseUrls.length) {
      isLocal = /^http(s)?\:\/\/localhost/gmi.test(loaderConfig.internalModuleBaseUrls[0]);
    } */

    if (this._hasTeamsContext) { // running in Teams
      return isLocal ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
    }

    return isLocal ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment;
  }

  private _getHomeSite = async (): Promise<void> => {
    return this.context.spHttpClient
      .get(`${this.context.pageContext.web.absoluteUrl}/_api/SP.SPHSite/Details`, SPHttpClient.configurations.v1, {
        headers: {
          accept: 'application/json;odata.metadata=none'
        }
      })
      .then(res => {
        if (!res.ok) {
          return Promise.reject(res.statusText);
        }
        return res.json();
      })
      .then(homeSiteDetails => {
        this._homeSiteUrl = homeSiteDetails.Url;
        this._hostName = (new URL(this._homeSiteUrl)).hostname;
        this._homeSiteId = homeSiteDetails.SiteId;
        this._homeSiteWebId = homeSiteDetails.WebId;
      }, err => {
        console.error(err);
        this._error = true;
        this._errorMessage = "Please check if the home site is set.";
      });
  }

  private async _getConfigListItems(): Promise<void> {
    const response = await this.context.spHttpClient
      .get(`${this._homeSiteUrl}/_api/web/lists/getByTitle('Wellbeing_Configuration')/items?$select=Title,Value`, SPHttpClient.configurations.v1, {
        headers: {
          accept: 'application/json;odata.metadata=none'
        }
      });

    const configListResponse = await response.json();

    if (configListResponse.error) {
      console.error(configListResponse.error);
      this._error = true;
      this._errorMessage = "Please check if the Configuration list set correctly in the home site.";
      return null;
    }

    try {
      this._wellbeingRequestsListName = find(configListResponse.value, v => v.Title === "WellbeingRequestsListName")["Value"];
      this._wellbeingGroupMailAddress = find(configListResponse.value, v => v.Title === "WellbeingGroupMailAddress")["Value"];
      this._wellbeingDocumentsDriveName = find(configListResponse.value, v => v.Title === "WellbeingDocumentsDriveName")["Value"];
    } catch (err) {
      this._error = true;
      this._errorMessage = "Please check if the Configuration list items are set correctly in the home site.";
    }

  }

  private async _getWellbeingDriveId(): Promise<void> {
    try {
      let allDrives = await MSGraph.Get(
        `/sites/${this._homeSiteId}/drives`,
        "v1.0",
        ["id, name"]);
        this._wellbeingDocumentsDriveId = find(allDrives.value, v => v.name === this._wellbeingDocumentsDriveName)["id"];
    } catch (err) {
      console.error(err);
      this._error = true;
      this._errorMessage = "Please check if the wellbeing doucments library name is set correctly in the config list.";
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);

    //
    // unregistering theme changed handlers
    //
    if (this._hasTeamsContext) {
      this.context.sdks.microsoftTeams.teamsJs.registerOnThemeChangeHandler(null);
    }
    else {
      this._themeProvider.themeChangedEvent.remove(this, this._handleSPThemeChangedEvent);
    }
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
