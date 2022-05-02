import { IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import * as strings from 'TimeoffAdaptiveCardExtensionStrings';

export class TimeoffPropertyPane {
  public getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.BasicGroupName,
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
