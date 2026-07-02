/**
 * Represents a SharePoint Hyperlink field value.
 */
export interface IHyperlink {
  Url: string;
  Description: string;
}

/**
 * Represents a SharePoint user resolved from a People/Group field.
 * `Id` holds the numeric SharePoint User ID as a string once the user has been resolved
 * via `ensureUser()`. Before resolution it may hold an email address or SIP address.
 */
export interface IUser {
  Id?: string;
  Title: string;
  EMail?: string;
  UserName?: string;
  JobTitle?: string;
}

/**
 * A concrete IUser returned by `SearchUsers()`.
 * `Id` defaults to `"-1"` as a sentinel indicating the user has not yet been resolved to a
 * numeric SharePoint User ID. `UpsertLead()` detects this (by checking whether `Id` parses
 * as a number) and calls `ensureUser()` to resolve it before writing the list item.
 */
export class UserField implements IUser {
  constructor(
    public Id: string = "-1",
    public Title: string = "",
    public EMail: string = "",
    public UserName: string = "",
    public JobTitle: string = ""
  ) { }
}

/**
 * Represents a single sales lead as stored in the "Sales Leads" SharePoint list.
 *
 * **Status lifecycle:** `SLStatus` moves through the pipeline in this order:
 * `status-lead` → `status-site-survey` → `status-proposal` → `status-won` | `status-lost`
 *
 * **User field:** `SLAssignedTo` is typed as `IUser | string` because SharePoint returns an
 * expanded user object on reads, but a search result from `SearchUsers()` temporarily holds
 * a SIP address string until it is resolved. `SLAssignedToId` is the numeric User ID that
 * SharePoint requires when writing the People field.
 */
export interface ILeadItem {
  Id?: number;
  Title: string;
  /** Current stage in the sales pipeline. */
  SLStatus: "status-lead" | "status-site-survey" | "status-proposal" | "status-won" | "status-lost";
  SLInstallationType: "" | "Residential" | "Commercial" | "Industrial" | "Utility-Scale";
  SLMarket: "" | "Northeast" | "Southeast" | "Midwest" | "Southwest" | "West Coast";
  SLClient: string;
  SLSiteAddress: string;
  SLContact: string;
  SLContactEmail: string;
  SLContactPhone: string;
  SLLeadSource: "" | "Referral" | "Website" | "Canvassing" | "Partner" | "Event" | "Cold Call";
  SLEstimatedSystemSizeKW: number;
  SLFinancingPreference: "" | "Cash" | "Loan" | "Lease" | "PPA";
  SLUtilityProvider: string;
  SLSummary: string;
  SLValue: number;
  /** Numeric SharePoint User ID — written to the list via the `SLAssignedToId` column. */
  SLAssignedToId?: number | undefined;
  /** Expanded user object on read; may hold a SIP/email string before `ensureUser()` resolution. */
  SLAssignedTo?: IUser | string;
  Author?: IUser;
  Created?: string | Date;
  Editor?: IUser;
  Modified?: string | Date;
}

/**
 * Default-valued ILeadItem used as the blank slate when creating a new lead.
 * Accepts an optional `Partial<ILeadItem>` to pre-populate any fields.
 * `Id` is set to `0` as the sentinel for "this item has not been saved to SharePoint yet"
 * — `UpsertLead()` checks `Id === 0` to decide between add and update.
 */
export class LeadItem implements ILeadItem {
  public Id: number = 0;
  public Title: string = "";
  public SLStatus: "status-lead" | "status-site-survey" | "status-proposal" | "status-won" | "status-lost" = "status-lead";
  public SLInstallationType: "" | "Residential" | "Commercial" | "Industrial" | "Utility-Scale" = "";
  public SLMarket: "" | "Northeast" | "Southeast" | "Midwest" | "Southwest" | "West Coast" = "";
  public SLClient: string = "";
  public SLSiteAddress: string = "";
  public SLContact: string = "";
  public SLContactEmail: string = "";
  public SLContactPhone: string = "";
  public SLLeadSource: "" | "Referral" | "Website" | "Canvassing" | "Partner" | "Event" | "Cold Call" = "";
  public SLEstimatedSystemSizeKW: number = 0;
  public SLFinancingPreference: "" | "Cash" | "Loan" | "Lease" | "PPA" = "";
  public SLUtilityProvider: string = "";
  public SLSummary: string = "";
  public SLValue: number = 0;

  constructor(item?: Partial<ILeadItem>) {
    if (item) {
      Object.assign(this, item);
    }
  }
}

/**
 * Write-only projection of ILeadItem used as the payload for SharePoint add/update calls.
 *
 * Intentionally omits `Id`, `Author`, `Editor`, `Created`, and `Modified` because
 * SharePoint manages these fields server-side and will reject requests that attempt to
 * set them directly. `SLAssignedToId` is included (as the numeric User ID) rather than
 * `SLAssignedTo` because SharePoint People fields are written via the `*Id` suffix column,
 * not the expanded lookup object.
 */
export class LeadItemUpdate implements ILeadItem {
  public Title: string = "";
  public SLStatus: "status-lead" | "status-site-survey" | "status-proposal" | "status-won" | "status-lost" = "status-lead";
  public SLInstallationType: "" | "Residential" | "Commercial" | "Industrial" | "Utility-Scale" = "";
  public SLMarket: "" | "Northeast" | "Southeast" | "Midwest" | "Southwest" | "West Coast" = "";
  public SLClient: string = "";
  public SLSiteAddress: string = "";
  public SLContact: string = "";
  public SLContactEmail: string = "";
  public SLContactPhone: string = "";
  public SLLeadSource: "" | "Referral" | "Website" | "Canvassing" | "Partner" | "Event" | "Cold Call" = "";
  public SLEstimatedSystemSizeKW: number = 0;
  public SLFinancingPreference: "" | "Cash" | "Loan" | "Lease" | "PPA" = "";
  public SLUtilityProvider: string = "";
  public SLSummary: string = "";
  public SLValue: number = 0;
  public SLAssignedToId: number = -1;

  constructor(item?: Partial<ILeadItem>) {
    if (item) {
      Object.assign(this, item);
    }
  }
}
