export enum Tables {
  IMAGESLIST = "Card Gallery Photos",
  NEWSLIST = "Site Pages",
}

export interface ILocation {
  id: number;
  displayName: string;
  city: string;
  state: string;
  country: string;
  date: string;
  tempCurrent: number;
  tempHi: number;
  tempLow: number;
  tempMeasure: string;
}

export class Location implements ILocation {
  constructor(
    public id: number,
    public displayName: string = "",
    public city: string = "",
    public state: string = "",
    public country: string = "",
    public date: string = "",
    public tempCurrent: 0,
    public tempHi: 0,
    public tempLow: 0,
    public tempMeasure: string = ""
  ) { }
}

export interface IImage {
  id: number;
  sortOrder: number;
  imageSrc: string;
  altText: string;
  title: string;
  description: string;
}

export class Image implements IImage {
  constructor(
    public id: number = 0,
    public sortOrder: number = 0,
    public imageSrc: string = "",
    public altText: string = "",
    public title: string = "",
    public description: string = "",
  ) { }
}

export interface IArticle {
  id: number;
  title: string;
  description: string;
  imageSrc: string;
  altText: string;
  url: string;
  liked: boolean;
}

export class Article implements IArticle {
  constructor(
    public id: number = 0,
    public title: string = "",
    public description: string = "",
    public imageSrc: string = "",
    public altText: string = "",
    public url: string = "",
    public liked: boolean = false,
  ) { }
}