import { Guid, ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { PageContext } from "@microsoft/sp-page-context";
import { spfi, SPFI, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/site-users";
import "@pnp/sp/batching";
import "@pnp/sp/content-types";
import "@pnp/sp/fields";
import "@pnp/sp/lists";
import "@pnp/sp/views";
import "@pnp/sp/items";
import { SearchQueryBuilder, SearchQueryInit, SearchResults } from "@pnp/sp/search";
import { ILeadItem, IUser, LeadItem, LeadItemUpdate, UserField } from "./models";
import mockData from "../../mockData/data.json";
import { IListInfo } from "@pnp/sp/lists";

interface IPeopleSearchResult {
  SipAddress?: string;
  PreferredName?: string;
  AccountName?: string;
}

export interface ISalesLeadService {
  readonly ready: number;
  readonly instanceId: string;
  readonly dateFormatter: Intl.DateTimeFormat;
  readonly currencyFormatter: Intl.NumberFormat;
  readonly statusList: { iconName: string, displayName: string }[];
  readonly selectedItem: ILeadItem;
  Init: (serviceScope: ServiceScope, instanceId: string, listId?: Guid | undefined, itemId?: number | undefined) => void;
  GetLead: (leadId: number) => ILeadItem | undefined;
  GetLeads: (status?: string) => ILeadItem[] | undefined;
  SelectLead: (index: number) => boolean;
  AddLead: () => boolean;
  UpsertLead: (item: ILeadItem) => Promise<boolean>;
  SearchUsers: (searchString: string) => Promise<IUser[]>;
}

/**
 * Provides all SharePoint data access and business logic for the Sales Lead System.
 *
 * **Singleton pattern:** A single instance is exported as `sl` at the bottom of this file
 * and shared by both the web part and the Form Customizer extension. Both call `sl.Init()`
 * which binds the service to the current SPFx `ServiceScope` so it can resolve `PageContext`
 * and create a properly authenticated PnP SP client.
 *
 * **Ready state machine:** `_ready` signals initialization progress and is polled by the
 * web part via `setInterval`:
 * - `-1` — Still initializing (waiting for `serviceScope.whenFinished`).
 * -  `0` — Failed (list could not be validated or data could not be loaded).
 * -  `1` — Ready (leads loaded, safe to render).
 */
export class SalesLeadService implements ISalesLeadService {
  private LOG_SOURCE = "🟢SalesLeadService";
  private PEOPLE_SOURCE_ID: string = "B09A7990-05EA-4AF9-81EF-EDFAB16C4E31";
  private SP_LEAD_LIST = "Sales Leads";
  private SP_LEAD_CT = "0x01009F7EEC938CE60548A94915C28DF5CAC4";
  private SP_ITEM_CT = "0x01";
  private SP_FORM_COMPONENT_ID = "dcf532f8-777b-4fcd-867e-b10d3435671e";
  public static readonly serviceKey: ServiceKey<ISalesLeadService> =
    ServiceKey.create<SalesLeadService>("SalesLeadService:ISalesLeadService", SalesLeadService);
  private _ready: number = -1;
  private _pageContext!: PageContext;
  private _sp!: SPFI;
  private _instanceId!: string;
  private _listId!: string;
  private _itemId!: number;
  private _leadItems!: ILeadItem[];
  private _leadItem!: ILeadItem;
  private _dateFormatter!: Intl.DateTimeFormat;
  private _currencyFormatter!: Intl.NumberFormat;

  public constructor() { }

  /**
   * Binds the service to the current SPFx ServiceScope and begins async initialization.
   *
   * Initialization is deferred inside `serviceScope.whenFinished()` because SPFx services
   * such as `PageContext` are not yet available at the time `Init()` is called synchronously
   * from `onInit`. The callback fires once the scope is fully populated.
   *
   * On completion `_ready` is set to `1` (success) or `0` (failure). The web part polls
   * `sl.ready` via `setInterval` and re-renders when the value changes from `-1`.
   *
   * @param serviceScope - The SPFx ServiceScope from the web part or form customizer context.
   * @param instanceId - The unique web part instance ID, used to generate unique element IDs.
   * @param listId - Optional: list GUID when called from the Form Customizer (pre-resolves the list).
   * @param itemId - Optional: item ID when called from the Form Customizer (loads a single item).
   */
  public Init(serviceScope: ServiceScope, instanceId: string, listId: Guid | undefined, itemId: number | undefined): void {
    try {
      this._ready = -1;
      this._instanceId = instanceId;
      this._leadItems = (mockData as unknown as ILeadItem[]).map(item => ({
        ...item,
        SLAssignedToId: item.SLAssignedToId ?? undefined,
        SLAssignedTo: item.SLAssignedTo ?? undefined,
        Created: item.Created ? new Date(item.Created as string) : undefined,
        Modified: item.Modified ? new Date(item.Modified as string) : undefined,
      }));
      serviceScope.whenFinished(async (): Promise<void> => {
        try {
          this._pageContext = serviceScope.consume(PageContext.serviceKey);
          const options: Intl.DateTimeFormatOptions = {
            year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", hour12: true
          };
          this._dateFormatter = new Intl.DateTimeFormat(this._pageContext.cultureInfo.currentUICultureName, options);
          this._currencyFormatter = new Intl.NumberFormat(this._pageContext.cultureInfo.currentUICultureName, { style: 'currency', currency: "USD" });
          this._sp = spfi().using(SPFx({ pageContext: this._pageContext }));
          const valid = await this._validateList();
          if (valid) {
            if (listId && itemId) {
              this._listId = listId.toString();
              this._itemId = itemId;
              const item = await this._sp.web.lists.getById(listId.toString()).items.getById(itemId).select("Id", "Title", "SLStatus", "SLInstallationType", "SLMarket", "SLClient", "SLSiteAddress", "SLContact", "SLContactEmail", "SLContactPhone", "SLLeadSource", "SLEstimatedSystemSizeKW", "SLFinancingPreference", "SLUtilityProvider", "SLSummary", "SLValue", "SLAssignedToId", "SLAssignedTo/Title", "SLAssignedTo/EMail", "SLAssignedTo/UserName", "Author/Title", "Author/EMail", "Author/UserName", "Created", "Editor/Title", "Editor/EMail", "Editor/UserName", "Modified").expand("Author, Editor, SLAssignedTo")();
              if (item) {
                this._leadItem = {
                  Id: item.Id,
                  Title: item.Title,
                  SLStatus: item.SLStatus,
                  SLInstallationType: item.SLInstallationType,
                  SLMarket: item.SLMarket,
                  SLClient: item.SLClient,
                  SLSiteAddress: item.SLSiteAddress,
                  SLContact: item.SLContact,
                  SLContactEmail: item.SLContactEmail,
                  SLContactPhone: item.SLContactPhone,
                  SLLeadSource: item.SLLeadSource,
                  SLEstimatedSystemSizeKW: item.SLEstimatedSystemSizeKW,
                  SLFinancingPreference: item.SLFinancingPreference,
                  SLUtilityProvider: item.SLUtilityProvider,
                  SLSummary: item.SLSummary,
                  SLValue: item.SLValue,
                  SLAssignedToId: item.SLAssignedToId,
                  SLAssignedTo: item.SLAssignedTo,
                  Author: item.Author,
                  Editor: item.Editor,
                  Created: (item.Created !== null) ? new Date(item.Created) : undefined,
                  Modified: (item.Modified !== null) ? new Date(item.Modified) : undefined
                };
                this._ready = 1;
              } else {
                this._ready = 0;
              }
            } else {
              const success = await this._loadLeads();
              this._ready = (success) ? 1 : 0;
            }
          } else {
            this._ready = 0;
          }
        } catch (err) {
          this._ready = 0;
          console.error(this.LOG_SOURCE, "(Init-ServiceScope)", err);
        }
      });
    } catch (err) {
      this._ready = 0;
      console.error(this.LOG_SOURCE, "(Init)", err);
    }
  }

  public get ready(): number {
    return this._ready;
  }

  public get instanceId(): string {
    return this._instanceId;
  }

  public get selectedItem(): ILeadItem {
    return this._leadItem;
  }

  public get dateFormatter(): Intl.DateTimeFormat {
    return this._dateFormatter;
  }

  public get currencyFormatter(): Intl.NumberFormat {
    return this._currencyFormatter;
  }

  public get statusList(): { iconName: string, displayName: string }[] {
    return [
      { iconName: "status-lead", displayName: "Lead" },
      { iconName: "status-site-survey", displayName: "Site Survey" },
      { iconName: "status-proposal", displayName: "Proposal" },
      { iconName: "status-won", displayName: "Won" },
      { iconName: "status-lost", displayName: "Lost" }
    ];
  }

  public GetLead(leadId: number): ILeadItem | undefined {
    let retVal: ILeadItem | undefined = undefined;
    try {
      const lead = this._leadItems.find(i => i.Id === leadId);
      retVal = lead || undefined;
    } catch (err) {
      console.error(this.LOG_SOURCE, "(GetLead)", err);
    }
    return retVal;
  }

  public GetLeads(status?: string): ILeadItem[] | undefined {
    let retVal: ILeadItem[] | undefined = undefined;
    try {
      retVal = this._leadItems;
      if (status !== undefined) {
        retVal = this._leadItems.filter(i => i.SLStatus === status);
      }
    } catch (err) {
      console.error(this.LOG_SOURCE, "(GetLeads)", err);
    }
    return retVal;
  }

  private async _loadLeads(): Promise<boolean> {
    let retVal = false;
    try {
      const items = await this._sp.web.lists.getByTitle(this.SP_LEAD_LIST).items.select("Id", "Title", "SLStatus", "SLInstallationType", "SLMarket", "SLClient", "SLSiteAddress", "SLContact", "SLContactEmail", "SLContactPhone", "SLLeadSource", "SLEstimatedSystemSizeKW", "SLFinancingPreference", "SLUtilityProvider", "SLSummary", "SLValue", "SLAssignedToId", "SLAssignedTo/Title", "SLAssignedTo/EMail", "SLAssignedTo/UserName", "Author/Title", "Author/EMail", "Author/UserName", "Created", "Editor/Title", "Editor/EMail", "Editor/UserName", "Modified").expand("Author, Editor, SLAssignedTo")();

      this._leadItems = [];
      for (let i = 0; i < items.length; i++) {
        const item = {
          ...items[i],
          Created: (items[i].Created !== null) ? new Date(items[i].Created) : undefined,
          Modified: (items[i].Modified !== null) ? new Date(items[i].Modified) : undefined
        }
        this._leadItems.push(item);
      }
      retVal = true;
    } catch (err) {
      console.error(this.LOG_SOURCE, "(_loadLeads)", err);
    }
    return retVal;
  }

  public SelectLead(index: number): boolean {
    let retVal = false;
    try {
      this._leadItem = this._leadItems[index];
      retVal = true;
    } catch (err) {
      console.error(this.LOG_SOURCE, "(SelectLead)", err);
    }
    return retVal;
  }

  public AddLead(): boolean {
    let retVal = false;
    try {
      this._leadItem = new LeadItem();
      retVal = true;
    } catch (err) {
      console.error(this.LOG_SOURCE, "(AddLead)", err);
    }
    return retVal;
  }

  /**
   * Creates or updates a lead in SharePoint and refreshes the in-memory cache.
   *
   * **User resolution:** SharePoint People fields must be written using a numeric User ID
   * (`SLAssignedToId`), not an email or display name. When `SLAssignedTo.Id` is not a
   * number (e.g. it holds a SIP address or email from a search result), `ensureUser()` is
   * called to resolve it to a numeric SP User ID before saving.
   *
   * **New vs update:** `item.Id === 0` indicates a new item (see `LeadItem` default). After
   * creation the full item (including server-generated fields like `Created` and `Author`)
   * is fetched from SharePoint and pushed into the local cache. For updates, the local cache
   * entry is replaced with the modified item.
   *
   * @param item - The lead to save. Must have `Id === 0` for new items.
   * @returns `true` on success, `false` if the SP call failed (error logged to console).
   */
  public UpsertLead = async (item: ILeadItem): Promise<boolean> => {
    let retVal = false;
    try {
      const originalItem = structuredClone(item);
      if (item.SLAssignedTo && Number.isNaN(Number.parseInt((item.SLAssignedTo as IUser).Id as string))) {
        const user = await this._sp.web.ensureUser((item.SLAssignedTo as IUser).Id as string);
        originalItem.SLAssignedToId = user.Id;
        originalItem.SLAssignedTo = {
          ...user,
          Id: user.Id.toString()
        }
      }

      const leadItem = new LeadItemUpdate({
        Title: originalItem.Title,
        SLStatus: originalItem.SLStatus,
        SLInstallationType: originalItem.SLInstallationType,
        SLMarket: originalItem.SLMarket,
        SLClient: originalItem.SLClient,
        SLSiteAddress: originalItem.SLSiteAddress,
        SLContact: originalItem.SLContact,
        SLContactEmail: originalItem.SLContactEmail,
        SLContactPhone: originalItem.SLContactPhone,
        SLLeadSource: originalItem.SLLeadSource,
        SLEstimatedSystemSizeKW: originalItem.SLEstimatedSystemSizeKW,
        SLFinancingPreference: originalItem.SLFinancingPreference,
        SLUtilityProvider: originalItem.SLUtilityProvider,
        SLSummary: originalItem.SLSummary,
        SLValue: originalItem.SLValue,
        SLAssignedToId: originalItem.SLAssignedToId
      });

      let response: { Id: number };
      if (item.Id === 0) {
        response = await this._sp.web.lists.getById(this._listId).items.add(leadItem);
      } else {
        response = await this._sp.web.lists.getById(this._listId).items.getById(item.Id as number).update(leadItem);
      }
      if (response) {
        if (originalItem.Id === 0) {
          // Reload item
          const updatedItem = await this._sp.web.lists.getByTitle(this.SP_LEAD_LIST).items.getById(response.Id).select("Id", "Title", "SLStatus", "SLInstallationType", "SLMarket", "SLClient", "SLSiteAddress", "SLContact", "SLContactEmail", "SLContactPhone", "SLLeadSource", "SLEstimatedSystemSizeKW", "SLFinancingPreference", "SLUtilityProvider", "SLSummary", "SLValue", "SLAssignedToId", "SLAssignedTo/Title", "SLAssignedTo/EMail", "SLAssignedTo/UserName", "Author/Title", "Author/EMail", "Author/UserName", "Created", "Editor/Title", "Editor/EMail", "Editor/UserName", "Modified").expand("Author, Editor, SLAssignedTo")();
          this._leadItems.push(updatedItem);
        } else {
          const index = this._leadItems.findIndex((o) => { return o.Id === originalItem.Id });
          this._leadItems[index] = originalItem;
        }
        retVal = true;
      }
    } catch (err) {
      console.error(this.LOG_SOURCE, "(UpsertLead)", err);
    }
    return retVal;
  }

  /**
   * Searches for SharePoint users matching the given string using the SP Search API.
   *
   * Queries the **People** result source (`PEOPLE_SOURCE_ID`) which is scoped to users in
   * the tenant's directory. Results are filtered to exclude external guest accounts
   * (identified by `#ext#` in their identity string) because guests cannot own list items.
   *
   * The user identity set on the returned `UserField.Id` is the SIP address when available,
   * falling back to the claim account name. This value is later resolved to a numeric SP
   * User ID by `UpsertLead()` via `ensureUser()`.
   *
   * @param searchString - Partial name or email to search for.
   * @returns Array of matching users; empty array on no results or error.
   */
  public async SearchUsers(searchString: string): Promise<IUser[]> {
    const retVal: IUser[] = [];
    try {
      const q: SearchQueryInit = SearchQueryBuilder(`*${searchString}*`)
        .sourceId(this.PEOPLE_SOURCE_ID)
        .selectProperties("SipAddress", "PreferredName", "AccountName")
        .trimDuplicates;
      const people: SearchResults = await this._sp.search(q);
      people.PrimarySearchResults.forEach((result) => {
        const typedResult = result as unknown as IPeopleSearchResult;
        let userId = typedResult.SipAddress;
        if (typedResult.SipAddress === null || typedResult.SipAddress === undefined || typedResult.SipAddress.length < 1) {
          const account = typedResult.AccountName?.split("|") ?? [];
          userId = account[account.length - 1];
        }
        if (userId !== null && userId !== undefined && userId.length > 0 && userId.indexOf("#ext#") < 0) {
          retVal.push(new UserField(userId, typedResult.PreferredName ?? "", userId));
        }
      });
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (SearchUsers) - ${err}`);
    }
    return retVal;
  }

  /**
   * Ensures the "Sales Leads" SharePoint list exists and is correctly configured.
   *
   * On first run (list does not exist or has no items):
   * 1. Creates the list if it is missing.
   * 2. Calls `_ensureSalesLeadContentType()` to attach the custom content type and wire
   *    the Form Customizer component to New/Edit/Display forms.
   * 3. Calls `_createMockData()` to seed the list with 50 sample leads.
   *
   * Stores the list GUID in `_listId` for use by all subsequent read/write operations.
   */
  private async _validateList(): Promise<boolean> {
    let retVal = false;
    try {
      let list: IListInfo;
      try {
        list = await this._sp.web.lists.getByTitle(this.SP_LEAD_LIST)();
      } catch {
        list = await this._sp.web.lists.add(this.SP_LEAD_LIST.replace(" ", ""), this.SP_LEAD_LIST, 100, true);
        // update title
        void await this._sp.web.lists.getById(list.Id).update({ Title: this.SP_LEAD_LIST });
      }
      this._listId = list.Id;
      if (list.ItemCount < 1) {
        void await this._ensureSalesLeadContentType(list.Id as string);
        retVal = await this._createMockData(list.Id);
      } else {
        retVal = true;
      }
    } catch (err) {
      console.error(this.LOG_SOURCE, "(_validateList)", err);
    }
    return retVal;
  }

  /**
   * Attaches the Sales Lead content type to the list and wires up the Form Customizer.
   *
   * The Form Customizer replaces SharePoint's default New/Edit/Display forms with the
   * `SalesLeadForm` React component. This is done by setting `DisplayFormClientSideComponentId`,
   * `EditFormClientSideComponentId`, and `NewFormClientSideComponentId` on the content type
   * to the Form Customizer's manifest ID (`SP_FORM_COMPONENT_ID`).
   *
   * Also enables content types on the list, adds the Sales Lead content type, removes the
   * default "Item" content type so Sales Lead becomes the only option for new items, and
   * adds the key fields (`SLStatus`, `SLClient`, etc.) to the default view.
   */
  private async _ensureSalesLeadContentType(listId: string): Promise<void> {
    try {
      const updateCT = { DisplayFormClientSideComponentId: this.SP_FORM_COMPONENT_ID, EditFormClientSideComponentId: this.SP_FORM_COMPONENT_ID, NewFormClientSideComponentId: this.SP_FORM_COMPONENT_ID };
      try {
        const siteCT = await this._sp.web.contentTypes.getById(this.SP_LEAD_CT)();
        if (siteCT) {
          void await this._sp.web.contentTypes.getById(this.SP_LEAD_CT).update(updateCT);
        }
      } catch (err) {
        console.error(this.LOG_SOURCE, "(_ensureSalesLeadContentType)", err);
      }

      const listRef = this._sp.web.lists.getById(listId);

      // Ensure the list accepts custom content types before attempting to add one.
      void await listRef.update({ ContentTypesEnabled: true, DisableGridEditing: true } as unknown as IListInfo);

      let listCT = await listRef.contentTypes();
      const exists = listCT.find((ct) => { return ct.Id.StringValue.startsWith(this.SP_LEAD_CT) });
      if (exists) {
        void await listRef.contentTypes.getById(exists.Id.StringValue).update(updateCT);
      } else {
        void await listRef.contentTypes.addAvailableContentType(this.SP_LEAD_CT);
        listCT = await listRef.contentTypes();
        const addedExists = listCT.find((ct) => { return ct.Id.StringValue.startsWith(this.SP_LEAD_CT) });
        if (addedExists) {
          void await listRef.contentTypes.getById(addedExists.Id.StringValue).update(updateCT);
        }
      }

      // Add fields to default view
      void await listRef.defaultView.fields.add("SLStatus");
      void await listRef.defaultView.fields.add("SLClient");
      void await listRef.defaultView.fields.add("SLMarket");
      void await listRef.defaultView.fields.add("SLInstallationType");
      void await listRef.defaultView.fields.add("SLValue");
      //void await listRef.defaultView.fields.add("SLAssignedTo");

      // Remove base Item content type so Sales Lead is the default for new items.
      try {
        const itemCT = await listCT.find((o) => { return o.Name === 'Item'; });
        if (itemCT) {
          void await listRef.contentTypes.getById(itemCT.Id.StringValue).delete();
        }
      } catch {
        // Item content type might already be removed or list policy may block deletion.
      }
    } catch (err) {
      console.error(this.LOG_SOURCE, "(_ensureSalesLeadContentType)", err);
    }
  }

  private async _createMockData(slListId: string): Promise<boolean> {
    let retVal = false;
    try {
      // add mock data
      const [spBatch, execute] = await this._sp.batched();
      const results: unknown[] = [];
      for (let i = 0; i < mockData.length; i++) {
        const leadItem = mockData[i] as unknown as ILeadItem;
        delete leadItem.Author;
        delete leadItem.Created;
        delete leadItem.Editor;
        delete leadItem.Modified;
        delete leadItem.Id;
        delete leadItem.SLAssignedTo;
        const newItem = {
          ...leadItem,
          Title: `${leadItem.SLClient} - ${leadItem.SLInstallationType} - ${leadItem.SLMarket}`,
          SLAssignedToId: null
        };
        spBatch.web.lists.getById(slListId).items.add(newItem).then((r) => { results.push(r) }, (e) => { console.error(e) });
      }
      void await execute();
      retVal = (results.length > 1);
    } catch (err) {
      console.error(this.LOG_SOURCE, "(_createMockData)", err);
    }
    return retVal;
  }
}

export const sl: ISalesLeadService = new SalesLeadService();