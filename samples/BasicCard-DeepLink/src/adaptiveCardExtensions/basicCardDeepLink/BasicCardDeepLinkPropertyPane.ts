import { IPropertyPaneConfiguration, PropertyPaneTextField, PropertyPaneCheckbox } from '@microsoft/sp-property-pane';
import * as strings from 'BasicCardDeepLinkAdaptiveCardExtensionStrings';

export class BasicCardDeepLinkPropertyPane {
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
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
              ],
            },
            {
              groupName: strings.SettingsGroupName,
              groupFields: [
                PropertyPaneTextField('linkUrl', {
                  label: strings.LinkUrlFieldLabel
                }),
                PropertyPaneCheckbox('teamsLink', {
                  text: strings.IsTeamsLinkFieldLabel
                })
              ],
            },
          ]
        },
      ],
    };
  }
}
