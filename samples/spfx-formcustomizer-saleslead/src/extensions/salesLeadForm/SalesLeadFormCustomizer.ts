import * as React from 'react';
import * as ReactDom from 'react-dom';
import {
  BaseFormCustomizer
} from '@microsoft/sp-listview-extensibility';
import SalesLeadForm, { ISalesLeadFormProps } from './components/SalesLeadForm';
import { ThemeProvider } from '@microsoft/sp-component-base';
import { SPFxThemes } from '@n8d/htwoo-react/SPFxThemes';
import { symset } from '@n8d/htwoo-react/SymbolSet';
import svgIcons from '../../common/status-iconset.svg';
import Placeholder from '../../common/components/atoms/Placeholder';
import LoadFailure from '../../common/components/atoms/LoadFailure';
import { sl } from '../../common/services/slService';

/**
 * If your form customizer uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ISalesLeadFormCustomizerProperties { }


export default class SalesLeadFormCustomizer
  extends BaseFormCustomizer<ISalesLeadFormCustomizerProperties> {
  private LOG_SOURCE = "🟢SalesLeadWebPart";
  private _spfxThemes = new SPFxThemes();
  private _calls: number = 0;
  private _waiting!: number;

  protected async onInit(): Promise<void> {
    try {
      // Initialize Icons Symbol Set
      await symset.initSymbols(svgIcons);

      // Consume the new ThemeProvider service
      const themeProvider = this.context.serviceScope.consume(ThemeProvider.serviceKey);
      this._spfxThemes.initThemeHandler(this.domElement, themeProvider);

      // Pass the ServiceScope and AAD token factory to SLService. The service uses
      // these to create PnP SP and Graph clients without handling credentials directly.
      sl.Init(this.context.serviceScope, this.context.instanceId, this.context.list.guid, this.context.itemId);
      void this._firstLoad();
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (onInit) - ${err}`);
    }
  }

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
   * - `sl.ready === 1`: Ready → render the TeamSummaryAgent chat component.
   */
  public render(): void {
    try {
      let element: React.ReactElement | null = null;
      if (sl.ready === -1) {
        element = React.createElement(Placeholder, {});
      } else if (sl.ready === 0) {
        element = React.createElement(LoadFailure, {})
      } else {
        const props: ISalesLeadFormProps = {
          displayMode: this.displayMode,
          onSave: this._onSave,
          onClose: this._onClose
        };
        element = React.createElement(SalesLeadForm, props);
      }
      ReactDom.render(element as React.ReactElement, this.domElement);
    } catch (err) {
      console.error(this.LOG_SOURCE, "(render)", err);
    }
  }

  protected onDispose(): void {
    super.onDispose();
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  private _onSave = (): void => {

    // You MUST call this.formSaved() after you save the form.
    this.formSaved();
  }

  private _onClose = (): void => {
    // You MUST call this.formClosed() after you close the form.
    this.formClosed();
  }
}
