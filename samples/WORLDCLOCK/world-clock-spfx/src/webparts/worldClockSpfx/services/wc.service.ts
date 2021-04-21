import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";
import { sp } from "@pnp/sp";
import "@pnp/polyfill-ie11";

export interface IWorldClockService {

}

export class WorldClockService implements IWorldClockService {
  private LOG_SOURCE: string = "🔶WorldClockService";

  constructor() {
  }

}

export const wcs = new WorldClockService();