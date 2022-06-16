import { IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import * as strings from 'HelpdeskcreateticketAdaptiveCardExtensionStrings';

export class HelpdeskcreateticketPropertyPane {
  public getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.GroupName,
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
