import { AdaptiveCardExtensionContext } from '@microsoft/sp-adaptive-card-extension-base';
import { IPropertyPaneButtonProps, IPropertyPaneConfiguration, IPropertyPaneField, IPropertyPanePage, PropertyPaneButton, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import * as strings from 'HelpdeskcreateticketAdaptiveCardExtensionStrings';
import { HelpDeskLibraryFields } from '../../common/models/designtemplate.models';
import { dtg } from '../../common/services/designtemplate.service';

import "@pnp/sp/webs";
import { sp } from '@pnp/sp';

export class HelpdeskcreateticketPropertyPane {
  constructor(
    public context: AdaptiveCardExtensionContext = null) {
  }


  private createList = async (): Promise<void> => {
    try {
      const result: boolean = await dtg.createList("HelpDeskTickets", "Document library to hold ticket image uploads", HelpDeskLibraryFields);
      if (result) {
        this.context.propertyPane.refresh();
      }
    } catch (err) {
      console.error(`${err} - (createList)`);
    }
  };

  public getPropertyPaneConfiguration(): IPropertyPaneConfiguration {

    const ppConfig: IPropertyPaneConfiguration = {
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
                PropertyPaneTextField('bingMapsKey', {
                  label: strings.BingMapsAPIKeyLabel,
                  description: strings.BingMapsAPIKeyDescription
                }),
                PropertyPaneTextField('iconProperty', {
                  label: strings.IconPropertyFieldLabel
                })
              ]
            }
          ],
        },
      ],
    };

    //const ticketsLibrary = await sp.web.lists.getByTitle("HelpDeskTickets");
    //if (ticketsLibrary) {

    //} else {

    const pages: IPropertyPanePage[] = ppConfig.pages;
    const group: any = pages[0].groups[0];
    const groupFields: IPropertyPaneField<any>[] = group.groupFields;
    const addListButton: IPropertyPaneField<IPropertyPaneButtonProps> = PropertyPaneButton("", {
      text: strings.AddLibraryButton,
      description: strings.AddLibraryDesc,
      onClick: this.createList
    });
    groupFields.push(addListButton);
    group.groupFields = groupFields;
    ppConfig.pages[0].groups[0] = group;
    //}

    return ppConfig;

    // return {
    //   pages: [
    //     {
    //       header: { description: strings.PropertyPaneDescription },
    //       groups: [
    //         {
    //           groupName: strings.GroupName,
    //           groupFields: [
    //             PropertyPaneTextField('title', {
    //               label: strings.TitleFieldLabel
    //             }),
    //             PropertyPaneTextField('iconProperty', {
    //               label: strings.IconPropertyFieldLabel
    //             })
    //           ]
    //         }
    //       ]
    //     }
    //   ]
    // };
  }
}
