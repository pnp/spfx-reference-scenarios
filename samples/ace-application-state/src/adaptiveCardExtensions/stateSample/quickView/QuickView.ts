import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import { IStateSampleAdaptiveCardExtensionProps, IStateSampleAdaptiveCardExtensionState } from '../StateSampleAdaptiveCardExtension';
import { getSP } from "../../../pnpjs";
import { message } from "./template/secret-message";

export interface IQuickViewData {
  subTitle: string;
  title: string;
  description: string;
}

export class QuickView extends BaseAdaptiveCardView<
  IStateSampleAdaptiveCardExtensionProps,
  IStateSampleAdaptiveCardExtensionState,
  IQuickViewData
> {
  public get data(): IQuickViewData {

    if (this.state.activeIndex < 0 || this.state.activeIndex > this.state.items.length) {
      return {
        title: `Invalid card selection (${this.state.activeIndex})`,
        subTitle: "",
        description: "",
      };
    }

    const { items } = this.state;

    const selectedMessage = items[this.state.activeIndex];

    if (!selectedMessage.Details) {

      setTimeout(async () => {

        const sp = getSP();

        const itemDetails = await sp.web.getItemDetails(selectedMessage.Id);

        selectedMessage.Details = itemDetails;

        this.setState({
          items,
        });

        // delay just to show state/UI update flow
      }, 3000);
    }

    return {
      title: selectedMessage.Title,
      description: selectedMessage?.Details || "Loading...",
      subTitle: selectedMessage.Id.toString(),
    }
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }

  public onAction(action: IActionArguments): void {

    if (action.id === "next") {

      const nextIndex = this.state.activeIndex + 1;

      if (nextIndex < this.state.items.length) {

        this.setState({
          activeIndex: nextIndex,
        });
      }

    } else if (action.id === "prev") {

      const prevIndex = this.state.activeIndex - 1;

      if (prevIndex > -1) {

        this.setState({
          activeIndex: prevIndex,
        });
      }

    } else if (action.id === "decrypt") {

      const { items } = this.state;

      const selectedMessage = items[this.state.activeIndex];

      selectedMessage.Details = message;

      this.setState({
        items,
      });

    }
  }
}