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

export interface ITweet {
  id: number;
  date: string;
  userAccount: string;
  userDisplayName: string;
  userPhoto: string;
  imageSrc: string;
  text: string;
  linkUrl: string;
  tweetUrl: string;
  liked: boolean;
}
export class Tweet implements ITweet {
  constructor(
    public id: number = 0,
    public date: string = "",
    public userAccount: string = "",
    public userDisplayName: string = "",
    public userPhoto: string = "",
    public imageSrc: string = "",
    public text: string = "",
    public linkUrl: string = "",
    public tweetUrl: string = "",
    public liked: boolean = false,
  ) { }
}

export interface ITask {
  id: number;
  title: string;
  assignedTo: string;
  dueDate: string;
}

export class Task implements ITask {
  constructor(
    public id: number = 0,
    public title: string = "",
    public assignedTo: string = "",
    public dueDate: string = "",
  ) { }
}

export interface ITaskList {
  userName: string;
  userPhoto: string;
  tasks: Task[];
}

export class TaskList implements ITaskList {
  constructor(
    public userName: string = "",
    public userPhoto: string = "",
    public tasks: Task[] = [],
  ) { }
}