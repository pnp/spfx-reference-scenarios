import { Caching } from "@pnp/queryable";
import { SPFI, spfi, SPFx } from "@pnp/sp";
import { getRandomString, PnPClientStorage, getHashCode } from "@pnp/core";
import { BaseComponentContext } from "@microsoft/sp-component-base";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/items/get-all";
import { Blocking, Resovable } from "../../blocking";

const str = getRandomString(6);
const storage = new PnPClientStorage();

declare module "@pnp/sp/fi" {
  interface SPFI {

    getLotsOfItems(title: string): Promise<{ Title: string, }[]>;

    getItemsCached(this: SPFI, title: string, top?: number): Promise<any[]>;

    getString(): string;
  }
}

export function bindDataLib(context: BaseComponentContext): SPFI {
  return spfi().using(SPFx(context));
}

// add blocking for one at a time.

let running: Promise<void> = null;

// now we just extend directly the SPFI prototype to include what we want.
SPFI.prototype.getLotsOfItems = async function (this: SPFI, title: string) {

  let resolve;

  if (running !== null) {
    await running;    
  }

  [running, resolve] = Resovable();

  try {

    // build but do not execute the query
    const query = this.web.lists.getByTitle(title).items.select("Title");

    // construct a cache key, could also be a param
    const cacheKey = `getLotsOfItems_${getHashCode(query.toRequestUrl())}`;

    // use our existing wrapper to get the items from the cache, or get them from the factory
    return await storage.local.getOrPut(cacheKey, () => query.getAll());

  } finally {

    resolve();
    running = null;
  }
}

SPFI.prototype.getItemsCached = async function (this: SPFI, title: string, top = 20) {

  // shows how easy it is to add caching to a request
  return this.web.lists.getByTitle(title).items.using(Caching(), Blocking("getItemsCached")).top(top)();
}

SPFI.prototype.getString = function (this: SPFI) {

  // show that we are using the same instance of the library
  return str;
}
