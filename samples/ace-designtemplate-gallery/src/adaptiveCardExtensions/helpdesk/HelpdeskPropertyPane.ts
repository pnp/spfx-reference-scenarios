import { IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import * as strings from 'HelpdeskAdaptiveCardExtensionStrings';

export class HelpdeskPropertyPane {
  public getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
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
                PropertyPaneTextField('iconProperty', {
                  label: strings.IconPropertyFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
