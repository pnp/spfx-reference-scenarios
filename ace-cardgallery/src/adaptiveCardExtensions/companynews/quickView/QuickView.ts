import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'CompanynewsAdaptiveCardExtensionStrings';
import { ICompanynewsAdaptiveCardExtensionProps, ICompanynewsAdaptiveCardExtensionState } from '../CompanynewsAdaptiveCardExtension';
import { Logger, LogLevel } from "@pnp/logging";

import { findIndex } from 'lodash';
import { Icons, LikedIcon, UnLikedIcon } from '../../../icons/cg.icons';
export interface IQuickViewData {
  title: string;
  description: string;
  imgSrc: string;
  imgAtlText: string;
  url: string;
  seeMoreLabel: string;
  likedIcon: string;
}

export class QuickView extends BaseAdaptiveCardView<
  ICompanynewsAdaptiveCardExtensionProps,
  ICompanynewsAdaptiveCardExtensionState,
  IQuickViewData
> {
  public get data(): IQuickViewData {
    const article = this.state.articles[this.state.currentArticleId];

    let likedIcon: string = UnLikedIcon;
    if (article.liked) {
      likedIcon = LikedIcon;
    }

    return {
      title: article.title,
      description: article.description,
      imgSrc: article.imageSrc,
      imgAtlText: article.altText,
      url: article.url,
      seeMoreLabel: strings.SeeMoreLabel,
      likedIcon: likedIcon
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }

  public async onAction(action: IActionArguments): Promise<void> {
    if (action.type === 'Submit') {
      const { id, newIndex } = action.data;
      if (id === 'previous') {
        let idx = findIndex(this.state.articles, { id: this.state.currentArticleId });
        let newViewId: number = this.state.currentArticleId;
        idx--;
        if (idx < 0) {
          newViewId = this.state.articles[this.state.articles.length - 1].id;
        } else {
          newViewId = this.state.articles[idx].id;
        }
        this.setState({ currentArticleId: newViewId });
      } else if (id === 'next') {
        let idx = findIndex(this.state.articles, { id: this.state.currentArticleId });
        let newViewId: number = this.state.currentArticleId;
        idx++;
        if (idx < this.state.articles.length) {
          newViewId = this.state.articles[idx].id;
        } else {
          newViewId = this.state.articles[0].id;
        }
        this.setState({ currentArticleId: newViewId });
      }
    }
  }
}