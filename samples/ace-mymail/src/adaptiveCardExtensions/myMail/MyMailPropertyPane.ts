import { IPropertyPaneConfiguration, IPropertyPaneDropdownOption, PropertyPaneDropdown, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import * as strings from 'MyMailAdaptiveCardExtensionStrings';
import { MailType } from './models/mymail.models';

export class MyMailPropertyPane {
  private LOG_SOURCE: string = "MyMailPropertyPane";
  private _mailTypes: IPropertyPaneDropdownOption[] = [];

  private getMailTypePropertyPaneOptions(): void {
    let options: IPropertyPaneDropdownOption[] = [];
    try {
      options.push({ key: MailType.all, text: strings.MailTypeAll });
      options.push({ key: MailType.focused, text: strings.MailTypeFocused });
      options.push({ key: MailType.other, text: strings.MailTypeOther });
    } catch (err) {
      console.error(`🔶 MyMailACE:${this.LOG_SOURCE} (getWebpartModePropertyPaneOptions) -- ${err} -- Error loading webpart mode property pane options.`);
    }
    this._mailTypes = options;
  }

  public getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    this.getMailTypePropertyPaneOptions();
    return {
      pages: [
        {
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupFields: [
                PropertyPaneTextField('title', {
                  label: strings.TitleFieldLabel
                }),
                PropertyPaneDropdown('mailType', {
                  label: strings.MailTypeLabel,
                  options: this._mailTypes
                }),
                PropertyPaneTextField('numToReturn', {
                  label: strings.NumToReturnFieldLabel
                }),
                PropertyPaneTextField('refreshRate', {
                  label: strings.RefreshRateFieldLabel
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}
