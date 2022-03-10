import { IPropertyPaneConfiguration, PropertyPaneSlider, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import * as strings from 'WellbeingReminderAdaptiveCardExtensionStrings';

export class WellbeingReminderPropertyPane {
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
                }),
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel,
                  multiline: true
                }),
                PropertyPaneTextField('wellbeingListName', {
                  label: strings.ListNamePropertyFieldLabel
                }),
                PropertyPaneSlider('maxWellbeingDays', {
                  label: strings.MaxWellbeingDaysPropertyFieldLabel,
                  min: 5,
                  max: 20,
                  value: 5,
                  showValue: true,
                  step: 1
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
