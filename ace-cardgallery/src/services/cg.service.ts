import { Logger, LogLevel } from "@pnp/logging";
import { Article, ILocation, Image, Tables } from "../models/cg.models";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import { IWeb, Web } from "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items/list";
import "@pnp/sp/search";
import { ISearchQuery, SearchResults, SearchQueryBuilder } from "@pnp/sp/search";


export interface ICardGalleryService {
  Ready: boolean;
  HandleExecuteDeepLink: (meetingUrl: string) => void;
  Init(locale: string): Promise<void>;
  ExecuteDeepLink(meetingUrl: string);
  GetLocations(): ILocation[];
  GetImages: () => Promise<Image[]>;
  GetArticles: () => Promise<Article[]>;
}

export class CardGalleryService implements ICardGalleryService {
  private LOG_SOURCE: string = "🔶 CardGalleryService";
  private _ready: boolean = false;
  private _siteUrl: string;
  private _executeDeepLink: (meetingUrl: string) => void;

  constructor() {
  }

  public get Ready(): boolean {
    return this._ready;
  }
  public set HandleExecuteDeepLink(value: (meetingUrl: string) => void) {
    this._executeDeepLink = value;
  }

  public async Init(siteUrl: string): Promise<void> {
    try {
      this._siteUrl = siteUrl;
      // await this._getConfig();
      this._ready = true;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (init) - ${err.message}`, LogLevel.Error);
    }
  }

  public GetLocations(): ILocation[] {
    let retVal: ILocation[] = [];
    try {
      //Sample pulls data from mock
      //To extend pull data from a list of your locations
      retVal = require("../mocks/locationsConfig.json");
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetLocations) - ${err} - `, LogLevel.Error);
    }
    return retVal;
  }

  public async GetImages(): Promise<Image[]> {
    let retVal: Image[] = [];
    try {
      const web = Web(this._siteUrl);
      const images = await web.lists.getByTitle(Tables.IMAGESLIST).items
        .top(5000)
        .select("SortOrder,Image, AltText,Title,ShortDescription")
        .orderBy("SortOrder")
        .get();
      images.map((i, index) => {
        const imgField = JSON.parse(i["Image"]);
        const imgSrc = `${imgField.serverUrl}${imgField.serverRelativeUrl}`;
        const img = new Image(index, i["SortOrder"], imgSrc, i["AltText"], i["Title"], (i["ShortDescription"]) ? i["ShortDescription"] : "");
        retVal.push(img);
      });
      let x = 1;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetImages) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }
  private async _getCurrentGetCurrentUserId(): Promise<number> {
    let retVal: number = null;
    try {
      const web = Web(this._siteUrl);
      const user = await Web(web, "currentuser").select("Id")();
      retVal = parseInt(user.Id, 10);

    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_getCurrentGetCurrentUserId) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  public async GetArticles(): Promise<Article[]> {
    let retVal: Article[] = [];
    try {
      const web = Web(this._siteUrl);
      const searchResults: SearchResults = await sp.search(<ISearchQuery>{
        Querytext: "IsDocument:True AND FileExtension:aspx AND PromotedState:2",
        RowLimit: 10,
        EnableInterleaving: true,
        SelectProperties: ["Title", "OriginalPath", "PictureThumbnailURL", "Description", "LikedByStringId"]
      });
      const userId = await this._getCurrentGetCurrentUserId();
      searchResults.PrimarySearchResults.map((i, index) => {
        let liked: boolean = false;
        if (i["LikedByStringId"] == userId) {
          liked = true;
        }
        const article = new Article(index, i["Title"], i["Description"], i["PictureThumbnailURL"], i["Title"], i["OriginalPath"], liked);
        retVal.push(article);
      });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetArticles) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }
  public async Like(web: IWeb, id: number): Promise<boolean> {
    let retVal: boolean = false;
    try {
      // if(){

      // }else{
      //   retVal =  this.lists.getByTitle().items
      //     .getById(id)
      //     .like();
      // }

    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetArticles) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  public async GetLikeStatus(id: number): Promise<boolean> {
    let retVal = false;
    try {



    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetLikeStatus) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  public ExecuteDeepLink(meetingUrl: string): void {
    if (typeof this._executeDeepLink == "function") {
      this._executeDeepLink(meetingUrl);
    }
  }

}

export const cg = new CardGalleryService();