import { extendFactory } from "@pnp/odata";
import { SPRest } from "@pnp/sp";
import { Web, IWeb } from "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/comments";
import { AdaptiveCardExtensionContext } from "@microsoft/sp-adaptive-card-extension-base";
import { CompanyArticle } from "./adaptiveCardExtensions/companyNews/types";

// extend our web object with the custom extensions below so typings work
declare module "@pnp/sp/webs" {
    interface IWeb {
        getCurrentUserId: (this: IWeb) => Promise<number>;
        getArticles: (this: IWeb, count?: number) => Promise<CompanyArticle[]>;
        getArticleContent: (this: IWeb, id: number) => Promise<string>;
        likeArticle: (this: IWeb, id: number) => Promise<void>;
        unlikeArticle: (this: IWeb, id: number) => Promise<void>;
    }
}

// extend the web factory to add our needed methods
// lots of ways to accomplish this, but extending here gives us a clean api to use across the application
extendFactory(Web, {

    // we do this to save importing all the site-user code for just current user
    getCurrentUserId: async function (this: IWeb): Promise<number> {

        const user = await Web(this, "currentuser").select("Id")();
        return parseInt(user.Id, 10);
    },

    getArticles: async function (this: IWeb, count = 5): Promise<CompanyArticle[]> {

        const userId = await this.getCurrentUserId();

        const articles = await this.lists.getByTitle("VivaDemoCompNews").items
            .select("Id", "Title", "svgicon", "topic", "vivaimg", "LikedByStringId")
            .orderBy("Modified", false)
            .top(count)<{
                Id: number,
                Title: string,
                svgicon: string,
                topic: string,
                vivaimg: string,
                LikedByStringId: string[],
            }[]>();

        return articles.map(a => {

            const imgJson = JSON.parse(a.vivaimg);

            return {
                id: a.Id,
                title: a.topic,
                imageUrl: `${imgJson.serverUrl}${imgJson.serverRelativeUrl}`,
                iconProperty: a.svgicon,
                primaryText: a.Title,
                liked: a.LikedByStringId?.indexOf(`${userId}`) > -1 || false,
            };
        });
    },

    getArticleContent: async function (this: IWeb, id: number): Promise<string> {

        const article = await this.lists.getByTitle("VivaDemoCompNews").items
            .getById(id)
            .select("fullcontent")();

        return article.fullcontent;
    },

    likeArticle: async function (this: IWeb, id: number): Promise<void> {

        return this.lists.getByTitle("VivaDemoCompNews").items
            .getById(id)
            .like();
    },

    unlikeArticle: async function (this: IWeb, id: number): Promise<void> {

        return this.lists.getByTitle("VivaDemoCompNews").items
            .getById(id)
            .unlike();
    },
});

let _context: AdaptiveCardExtensionContext | null = null;
let _sp: SPRest | null = null;

// a method we can use across the application to get a valid sp object, even when
// we no longer have access to the context, such as within views. This must be called
// the first time from the core ACE class to capture a ref to the context
export function getSP(context: AdaptiveCardExtensionContext = _context): SPRest {

    if (typeof _sp !== "undefined" && _sp !== null) {
        return _sp;
    }

    if (_context === null) {
        _context = context;
    }

    if (typeof _context === "undefined" || _context === null) {
        throw Error("You must call getSP passing the context within the Extension class before using it child views.");
    }

    const sp = new SPRest();

    // setup our sp as needed for this application
    sp.setup({
        spfxContext: context,
        sp: {
            headers: {
                "Accept": "application/json;odata=nometadata",
            },
        },
    });

    _sp = sp;

    return sp;
}
