import { IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import * as strings from 'SimplelistAdaptiveCardExtensionStrings';

export class SimplelistPropertyPane {
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
