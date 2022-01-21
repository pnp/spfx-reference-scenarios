import { IStateSampleItem } from "./adaptiveCardExtensions/stateSample/StateSampleAdaptiveCardExtension";
import { AdaptiveCardExtensionContext } from "@microsoft/sp-adaptive-card-extension-base";
import { spfi, SPFx, SPFI } from "@pnp/sp";
import { extendFactory, getRandomString, isArray } from "@pnp/core";
import { Caching } from "@pnp/queryable";
import { IWeb, Web } from "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields";

let _sp: SPFI = null;
const listTitle = "SPFxACEStateSampleList";

export function getSP(context?: AdaptiveCardExtensionContext): SPFI {

    if (_sp === null && typeof context !== "undefined") {
        _sp = spfi().using(SPFx(context));
    }

    return _sp;
}

declare module "@pnp/sp/webs" {
    /**
     * Returns the instance wrapped by the invokable proxy
     */
    interface IWeb {
        ensureDataList: (this: IWeb) => Promise<void>;
        getItems: (this: IWeb) => Promise<IStateSampleItem[]>;
        getItemDetails: (this: IWeb, id: number) => Promise<string>;
    }
}

extendFactory(Web, {

    /**
     * Ensures we have a list of data for the sample to run against
     * 
     * @param this 
     */
    ensureDataList: async function (this: IWeb) {

        // ensure the list
        const ler = await this.lists.ensure(listTitle, "A list used by the StateSample");

        if (ler.created) {

            // if we created the list, let's add some items to it so we have data to show
            const list = ler.list;

            // add a details field
            await list.fields.addMultilineText("SampleDetails", {
                RichText: true,
            });

            // add the items
            for (let i = 0; i < 10; i++) {
                list.items.add({
                    Title: getRandomString(10),
                    SampleDetails: getRandomString(500),
                });
            }
        }
    },

    getItems: async function (this: IWeb): Promise<IStateSampleItem[]> {

        // get a list ref
        const list = this.lists.getByTitle(listTitle);

        // setup our query, add caching in local storage as we don't think these will change often
        const items = list.items.top(20).select("Title", "Id").using(Caching({
            store: "local",
        }));

        // we want to ensure we transform our results ahead of caching so we use prepend
        items.on.post.prepend(async function (url, result: any[]) {

            if (isArray(result)) {
                result = result.map((r) => ({ Id: r.Id, Title: r.Title, Description: null }));
            }

            return [url, result];
        });

        // make our request for the information
        return items();
    },

    getItemDetails: async function (this: IWeb, id: number): Promise<string> {

        const list = this.lists.getByTitle(listTitle);

        // setup our query, add caching in local storage as we don't think these will change often
        return list.items.getById(id).select("SampleDetails")().then(r => r.SampleDetails);
    }
});

