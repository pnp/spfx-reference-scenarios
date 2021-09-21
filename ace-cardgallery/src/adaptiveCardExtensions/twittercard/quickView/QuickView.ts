import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments } from '@microsoft/sp-adaptive-card-extension-base';

import { findIndex } from 'lodash';

import { ITwittercardAdaptiveCardExtensionProps, ITwittercardAdaptiveCardExtensionState } from '../TwittercardAdaptiveCardExtension';


export interface IQuickViewData {
  userDisplayName: string;
  userPhoto: string;
  userAccount: string;
  date: string;
  text: string;
  imageSrc: string;
  linkUrl: string;
  tweetUrl: string;
}

export class QuickView extends BaseAdaptiveCardView<
  ITwittercardAdaptiveCardExtensionProps,
  ITwittercardAdaptiveCardExtensionState,
  IQuickViewData
> {
  public get data(): IQuickViewData {
    const tweet = this.state.tweets[this.state.currentTweetId];

    const date = new Date(tweet.date);
    return {
      userDisplayName: tweet.userDisplayName,
      userPhoto: tweet.userPhoto,
      userAccount: tweet.userAccount,
      date: date.toUTCString(),
      text: tweet.text,
      imageSrc: tweet.imageSrc,
      linkUrl: tweet.linkUrl,
      tweetUrl: tweet.tweetUrl

    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }

  public async onAction(action: IActionArguments): Promise<void> {
    if (action.type === 'Submit') {
      const { id, newIndex } = action.data;
      if (id === 'previous') {
        let idx = findIndex(this.state.tweets, { id: this.state.currentTweetId });
        let newViewId: number = this.state.currentTweetId;
        idx--;
        if (idx < 0) {
          newViewId = this.state.tweets[this.state.tweets.length - 1].id;
        } else {
          newViewId = this.state.tweets[idx].id;
        }
        this.setState({ currentTweetId: newViewId });
      } else if (id === 'next') {
        let idx = findIndex(this.state.tweets, { id: this.state.currentTweetId });
        let newViewId: number = this.state.currentTweetId;
        idx++;
        if (idx < this.state.tweets.length) {
          newViewId = this.state.tweets[idx].id;
        } else {
          newViewId = this.state.tweets[0].id;
        }
        this.setState({ currentTweetId: newViewId });
      }
    }
  }
}