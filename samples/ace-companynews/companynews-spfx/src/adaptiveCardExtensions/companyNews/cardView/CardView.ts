import {
  BaseImageCardView,
  IImageCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction,
  ICardButton,
  IActionArguments
} from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'CompanyNewsAdaptiveCardExtensionStrings';
import { ICompanyNewsAdaptiveCardExtensionProps, ICompanyNewsAdaptiveCardExtensionState } from '../CompanyNewsAdaptiveCardExtension';

export class CardView extends BaseImageCardView<ICompanyNewsAdaptiveCardExtensionProps, ICompanyNewsAdaptiveCardExtensionState> {

  public get data(): IImageCardParameters {

    if (this.state.articleIndex < 0) {
      // a loading view
      return {
        primaryText: strings.PrimaryText,
        imageUrl: 'https://blogs.microsoft.com/uploads/2017/09/WR-Microsoft-logo.jpg',
        title: "Loading...",
        iconProperty: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2048 2048'%3E%3Cpath d='M1408 640v384h-384V896h190q-45-60-112-94t-142-34q-59 0-111 20t-95 55-70 85-38 107l-127-22q14-81 54-149t98-118 133-78 156-28q91 0 174 35t146 102V640h128zm-448 768q58 0 111-20t95-55 70-85 38-107l127 22q-14 81-54 149t-98 118-133 78-156 28q-91 0-174-35t-146-102v137H512v-384h384v128H706q45 60 112 94t142 34z' fill='%23333333'%3E%3C/path%3E%3C/svg%3E",
      };
    }

    // return the selected article from state
    return this.state.articles[this.state.articleIndex];
  }

  get cardButtons(): [ICardButton] | [ICardButton, ICardButton] | undefined {

    if (this.state.articleIndex > -1) {

      const buttons = [];

      // here we add buttons based on where we are in the paging
      if (this.state.articleIndex > 0) {

        buttons.push({
          id: "prev",
          title: "Prev",
          action: {
            type: "Submit"
          }
        });
      }

      if (this.state.articleIndex < 4) {

        buttons.push({
          id: "next",
          title: "Next",
          action: {
            type: "Submit"
          }
        });
      }

      return <any>buttons;
    }
  }

  public onAction(action: IActionArguments): void {

    // other option would be to do it here? but then this card needs to know what info the other view requires?

    if (action?.id === "next") {

      this.setState({
        articleIndex: this.state.articleIndex + 1,
      });

    } else if (action?.id === "prev") {

      this.setState({
        articleIndex: this.state.articleIndex - 1,
      });

    }
  }

  public get onCardSelection(): IQuickViewCardAction | IExternalLinkCardAction | undefined {

    // when clicked load the quick view to show the article details
    return {
      type: 'QuickView',
      parameters: {
        view: "CompanyNews_QUICK_VIEW"
      },
    };
  }
}
