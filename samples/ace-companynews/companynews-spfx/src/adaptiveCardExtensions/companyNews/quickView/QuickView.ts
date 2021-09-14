import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'CompanyNewsAdaptiveCardExtensionStrings';
import { ICompanyNewsAdaptiveCardExtensionProps, ICompanyNewsAdaptiveCardExtensionState } from '../CompanyNewsAdaptiveCardExtension';
import { getSP } from "../../../pnpjs";

export interface IQuickViewData {
  title: string;
  topic: string;
  content: string;
  itemId: number;
  iconsvg: string;
  imageUrl: string;
  likedIconUrl: string;
}

// we inline our svgs, another option is to import them
const likedUrl = "data:image/svg+xml,%0A%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2048 2048'%3E%3Cpath d='M1856 640q39 0 74 15t61 41 42 61 15 75q0 32-10 61l-256 768q-10 29-28 53t-42 42-52 26-60 10h-512q-179 0-345-69-72-29-144-44t-151-15H0V768h417q65 0 122-24t104-70l622-621q25-25 50-39t61-14q33 0 62 12t51 35 34 51 13 62q0 81-18 154t-53 146q-20 43-34 87t-19 93h444z' fill='%23333333'%3E%3C/path%3E%3C/svg%3E";
const unlikedUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2048 2048'%3E%3Cpath d='M1856 640q39 0 74 15t61 41 42 61 15 75q0 32-10 61l-256 768q-10 29-28 53t-42 42-52 26-60 10h-512q-179 0-345-69-72-29-144-44t-151-15H0V768h417q65 0 122-24t104-70l622-621q25-25 50-39t61-14q33 0 62 12t51 35 34 51 13 62q0 81-18 154t-53 146q-20 43-34 87t-19 93h444zm-256 1024q20 0 37-12t24-32q5-14 18-54t33-96 42-124 46-137 44-134 39-118 27-86 10-39q0-26-19-45t-45-19h-576q0-53 2-98t10-89 22-86 37-91q28-58 42-118t15-126q0-14-9-23t-23-9q-6 0-10 4t-9 9L734 765q-32 32-68 56t-78 41q-80 34-171 34H128v640h320q178 0 345 69 144 59 295 59h512z' fill='%23333333'%3E%3C/path%3E%3C/svg%3E";

export class QuickView extends BaseAdaptiveCardView<ICompanyNewsAdaptiveCardExtensionProps, ICompanyNewsAdaptiveCardExtensionState, IQuickViewData> {

  public get data(): IQuickViewData {

    // we have no selected article (shouldn't happen) so we just return a generic loading message
    if (this.state.articleIndex < 0) {
      return {
        topic: "",
        title: "Loading...",
        content: "",
        itemId: 0,
        iconsvg: "",
        imageUrl: "",
        likedIconUrl: unlikedUrl,
      };
    }

    // grab our articles
    const { articles } = this.state;

    // get the currently selected article
    const item = articles[this.state.articleIndex];

    // get the content property of that item
    let { content } = item;

    if (!content) {

      // our content isn't present so we need to request it

      // this could be in onInit for this view? Is there a way to do that?
      setTimeout(async () => {

        // we get our previously cached sp instance to make requests
        const sp = getSP();

        // load and set the content
        item.content = await sp.web.getArticleContent(item.id);

        // update our state with the reloaded the articles
        this.setState({
          articles,
        });

      }, 0);

      // while we wait show a message in the content space, which should only appear very quickly
      content = "Fetching...";
    }

    // return the selected article details
    return {
      topic: item.title,
      title: item.primaryText,
      content,
      itemId: item.id,
      iconsvg: item.iconProperty,
      imageUrl: item.imageUrl,
      likedIconUrl: item.liked ? likedUrl : unlikedUrl,
    };
  }

  public onAction(action: IActionArguments): void {

    if (action.id.indexOf("like") > -1) {

      // review that this can also be a separate function
      setTimeout(async () => {

        // we get our previously cached sp instance to make requests
        const sp = getSP();

        const { articles } = this.state;
        const item = articles[this.state.articleIndex];

        // toggle the like / unlike depending on the current setting
        if (item.liked) {
          await sp.web.unlikeArticle((<any>action).data.id);
        } else {
          await sp.web.likeArticle((<any>action).data.id);
        }

        item.liked = !item.liked;
        item.likedIconUrl = item.liked ? likedUrl : unlikedUrl;

        this.setState({
          articles,
        });

      }, 0);
    }
  }

  public get template(): ISPFxAdaptiveCard {

    return require('./template/QuickViewTemplate.json');
  }
}