import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { type IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { ThemeProvider } from '@microsoft/sp-component-base';
import { SPFxThemes } from '@n8d/htwoo-react/SPFxThemes';
import { symset } from '@n8d/htwoo-react/SymbolSet';
import svgIcons from '../../common/status-iconset.svg';
import SalesLead, { ISalesLeadProps } from './components/SalesLead';
import * as microsoftTeams from '@microsoft/teams-js-v2';
import Placeholder from '../../common/components/atoms/Placeholder';
import LoadFailure from '../../common/components/atoms/LoadFailure';
import { sl } from '../../common/services/slService';
import { ILeadItem } from '../../common/services/models';

export interface ISalesLeadWebPartProps {
  mode: "crud" | "statusleads";
  crudType: "view" | "edit" | undefined;
  leadStatus: "status-lead" | "status-site-survey" | "status-proposal" | "status-won" | "status-lost" | undefined;
  data: ILeadItem | ILeadItem[];
}

export default class SalesLeadWebPart extends BaseClientSideWebPart<ISalesLeadWebPartProps> {
  private LOG_SOURCE = "🟢SalesLeadWebPart";
  private _spfxThemes = new SPFxThemes();
  private _microsoftTeams: microsoftTeams.app.Context | null = null;
  private _calls: number = 0;
  private _waiting!: number;

  protected async onInit(): Promise<void> {
    try {
      // Initialize Icons Symbol Set
      await symset.initSymbols(svgIcons);

      // Consume the new ThemeProvider service
      this._microsoftTeams = await this.context.sdks.microsoftTeams?.teamsJs?.app?.getContext() || null;
      const themeProvider = this.context.serviceScope.consume(ThemeProvider.serviceKey);
      this._spfxThemes.initThemeHandler(this.domElement, themeProvider, this._microsoftTeams);

      // Pass the ServiceScope and AAD token factory to SLService. The service uses
      // these to create PnP SP and Graph clients without handling credentials directly.
      sl.Init(this.context.serviceScope, this.context.instanceId);
      void this._firstLoad();
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (onInit) - ${err}`);
    }
  }

  /**
   * Polls `sl.ready` every 100 ms and triggers `render()` once the service is initialized.
   *
   * `sl.Init()` performs async work (waiting on ServiceScope, creating the SP list, loading
   * items) that cannot be directly awaited in `onInit` — the SPFx lifecycle does not wait
   * for promises returned by arbitrary async calls started inside `onInit`. The polling
   * pattern here bridges that gap: `onInit` starts the async work and immediately returns,
   * while this interval watches for the ready signal and re-renders when it arrives.
   *
   * The loop stops after 600 checks (~60 seconds) as a safety valve so it does not poll
   * indefinitely if initialization fails silently.
   */
  private async _firstLoad(): Promise<void> {
    try {
      const stop = (): void => {
        clearInterval(this._waiting);
      };

      //Re-render when ready or calls > 600
      const checkRender = async (): Promise<void> => {
        if (sl.ready > -1 || this._calls > 600) {
          stop();
          this.render();
        } else {
          this._calls++;
        }
      };

      this._waiting = window.setInterval(checkRender, 100);
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (_firstLoad) ${err}`);
    }
  }

  /**
   * Renders one of three React components based on initialization state:
   * - `sl.ready === -1`: Still initializing → show Placeholder (spinner).
   * - `sl.ready === 0`: Initialization failed → show LoadFailure (error message).
   * - `sl.ready === 1`: Ready → render the SalesLead component.
   */
  public render(): void {
    try {
      let element: React.ReactElement | null = null;
      if (sl.ready === -1) {
        element = React.createElement(Placeholder, {});
      } else if (sl.ready === 0) {
        element = React.createElement(LoadFailure, {})
      } else {
        const props: ISalesLeadProps = {
          mode: this.properties.mode,
          crudType: this.properties.crudType || undefined,
          leadStatus: this.properties.leadStatus || undefined,
          data: sl.GetLeads() as ILeadItem[]
        };
        element = React.createElement(SalesLead, props);
      }
      ReactDom.render(element as React.ReactElement, this.domElement);
    } catch (err) {
      console.error(this.LOG_SOURCE, "(render)", err);
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  /**
   * Returns the property pane configuration for this web part.
   * This sample stores all settings in SharePoint (SiteAssets) via the Configuration
   * component rather than in the SPFx property bag, so the property pane is empty.
   * To add SPFx property pane fields, populate the `pages` array here.
   */
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: []
    };
  }
}
