import * as React from "react";

import HOOLabel from "@n8d/htwoo-react/HOOLabel";
import HOOText from "@n8d/htwoo-react/HOOText";
import { isEqual } from "@microsoft/sp-lodash-subset/lib/index";
import { ILeadItem, IUser, LeadItem } from "../../../common/services/models";
import { sl } from "../../../common/services/slService";
import HOONumber from "@n8d/htwoo-react/HOONumber";
import HOODropDown from "@n8d/htwoo-react/HOODropDown";
import HOOButton, { HOOButtonType } from "@n8d/htwoo-react/HOOButton";
import UserLookup from "../atoms/UserLookup";
import NavSelector, { ISelectorObj } from "../atoms/NavSelector";
import NavItem from "../atoms/NavItem";

export interface ILeadFormProps {
  source: "webpart" | "form";
  mode: "view" | "edit" | "new" | undefined;
  item: ILeadItem;
  onSave: () => void;
  onClose: () => void;
}

export interface ILeadFormState {
  originalItem: ILeadItem | undefined;
  currentItem: ILeadItem | undefined;
  dirty: boolean;
  valid: string;
  changeMode: "view" | "edit" | "new" | undefined;
}

export class LeadFormState implements ILeadFormState {
  public constructor(
    public originalItem: ILeadItem | undefined = undefined,
    public currentItem: ILeadItem | undefined = undefined,
    public dirty: boolean = false,
    public valid: string = "",
    public changeMode: "view" | "edit" | "new" | undefined = undefined
  ) { }
}

/**
 * Dual-mode form component used by both the web part and the Form Customizer extension.
 *
 * **State snapshot pattern:** On mount (and whenever `props.item` changes) two copies of
 * the item are stored: `originalItem` (frozen snapshot) and `currentItem` (working copy).
 * `isEqual(originalItem, currentItem)` drives the `dirty` flag, which enables or disables
 * the Save button — preventing unnecessary API calls when nothing has changed.
 *
 * **Mode override:** `props.mode` sets the initial display mode (`"view"` | `"edit"` | `"new"`).
 * `state.changeMode` can override this locally to transition from view → edit without
 * involving the parent component. The render method evaluates `(state.changeMode || props.mode)`
 * so the local override always takes precedence.
 *
 * **Two render paths:** `viewRender()` produces a fully read-only layout. `editRender()`
 * produces an editable form with validation. Separating them keeps each path clean and
 * avoids a tangle of conditional `readonly` props on every field.
 *
 * **Deep-path field updates:** `_onChangeStringValue(fieldName, value)` supports dotted
 * field names like `"SLAssignedTo.Title"` by splitting on `.` and using `reduce` to walk
 * the object graph to the parent node before setting the leaf value. This allows nested
 * fields to be updated with the same generic handler as flat fields.
 *
 * **Source prop:** When `source === "webpart"` the view toolbar shows an Edit button so the
 * user can switch to edit mode inline. When `source === "form"` (Form Customizer) the Edit
 * button is omitted because the SharePoint form framework handles mode switching externally.
 */
export default class LeadForm extends React.PureComponent<ILeadFormProps, ILeadFormState> {
  private LOG_SOURCE = "🟢LeadForm";
  private _installationTypeOptions: ISelectorObj[] = [
    { Id: 'Residential', IconName: 'icon-building-regular', DisplayName: 'Residential', ColorIndex: 1 },
    { Id: 'Commercial', IconName: 'icon-building-shop-regular', DisplayName: 'Commercial', ColorIndex: 2 },
    { Id: 'Industrial', IconName: 'icon-building-factory-regular', DisplayName: 'Industrial', ColorIndex: 3 },
    { Id: 'Utility-Scale', IconName: 'icon-developer-board-lightning-toolbox-regular', DisplayName: 'Utility-Scale', ColorIndex: 4 }
  ];
  private _statusOptions: ISelectorObj[] = [
    { Id: 'status-lead', IconName: 'status-lead', DisplayName: 'Lead', ColorIndex: 5 },
    { Id: 'status-site-survey', IconName: 'status-site-survey', DisplayName: 'Site Survey', ColorIndex: 2 },
    { Id: 'status-proposal', IconName: 'status-proposal', DisplayName: 'Proposal', ColorIndex: 3 },
    { Id: 'status-won', IconName: 'status-won', DisplayName: 'Won', ColorIndex: 1 },
    { Id: 'status-lost', IconName: 'status-lost', DisplayName: 'Lost', ColorIndex: 4 }
  ];
  private _financingOptions: ISelectorObj[] = [
    { Id: 'Cash', IconName: 'icon-money-hand-regular', DisplayName: 'Cash', ColorIndex: 1 },
    { Id: 'Loan', IconName: 'icon-money-calculator-regular', DisplayName: 'Loan', ColorIndex: 2 },
    { Id: 'Lease', IconName: 'icon-receipt-money-regular', DisplayName: 'Lease', ColorIndex: 3 },
    { Id: 'PPA', IconName: 'icon-building-retail-money-regular', DisplayName: 'PPA', ColorIndex: 4 }
  ];

  public constructor(props: ILeadFormProps) {
    super(props);
    try {
      const originalItem: ILeadItem = (props.item) ? structuredClone(props.item) : new LeadItem();
      const currentItem: ILeadItem = structuredClone(originalItem);
      this.state = new LeadFormState(originalItem, currentItem);
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (constructor) - ${err}`);
    }
  }

  public componentDidUpdate(prevProps: Readonly<ILeadFormProps>, prevState: Readonly<ILeadFormState>): void {
    try {
      if (!isEqual(prevProps.item, this.props.item)) {
        const currentItem = structuredClone(this.props.item);
        const valid = this._formValid(currentItem);
        this.setState({ originalItem: structuredClone(this.props.item), currentItem, valid });
      }
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (componentDidUpdate) - ${err}`);
    }
  }

  private _formValid = (currentItem: ILeadItem): string => {
    let retVal: string = "Form is not valid";
    try {
      const validString: string[] = [];
      if (currentItem.Title === undefined || currentItem.Title?.length < 1) {
        validString.push("Title is a required field.");
      }
      if (currentItem.SLStatus === undefined || currentItem.SLStatus?.length < 1) {
        validString.push("Status is a required field.");
      }
      retVal = validString.join(" ");
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (_formValid) - ${err}`);
    }
    return retVal;
  }

  private _onChangeString = (fieldName: string, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    try {
      const value = event.target.value;
      this._onChangeStringValue(fieldName, value);
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (_onChangeString) - ${err}`);
    }
  }

  private _onChangeStringValue = (fieldName: string, value: string): void => {
    try {
      if (!this.state.currentItem) { return; }
      const currentItem = structuredClone(this.state.currentItem);
      // used to get an object hierarchy for data property
      const fields = fieldName.split(".");
      // reduces the object reference to the parent and then sets the property value.
      fields.slice(0, -1).reduce((obj, key) => obj[key], currentItem)[fields[fields.length - 1]] = value;
      const valid = this._formValid(currentItem);
      this.setState({ currentItem, dirty: true, valid });
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (_onChangeStringValue) - ${err}`);
    }
  }

  private _onChangeNumber = (fieldName: string, event: React.ChangeEvent<HTMLInputElement>): void => {
    try {
      if (!this.state.currentItem) { return }
      const value = event.target.value;
      const currentItem = structuredClone(this.state.currentItem);
      currentItem[fieldName] = parseFloat(value) || 0;
      const valid = this._formValid(currentItem);
      this.setState({ currentItem, dirty: true, valid });
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (_onChangeNumber) - ${err}`);
    }
  }


  private _addUser = (user: IUser, fieldName: string): void => {
    try {
      if (!this.state.currentItem) { return; }
      const currentItem = structuredClone(this.state.currentItem);
      currentItem[fieldName] = user;
      currentItem[`${fieldName}Id`] = user.Id;
      const valid = this._formValid(currentItem);
      this.setState({ currentItem, dirty: true, valid });
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (_addUser) - ${err}`);
    }
  }

  private _removeUser = (fieldName: string): void => {
    try {
      if (!this.state.currentItem) { return; }
      const currentItem = structuredClone(this.state.currentItem);
      currentItem[fieldName] = undefined;
      currentItem[`${fieldName}Id`] = undefined;
      const valid = this._formValid(currentItem);
      this.setState({ currentItem, dirty: true, valid });
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (_removeUser) - ${err}`);
    }
  }

  private _formSave = async (): Promise<void> => {
    try {
      const saved = await sl.UpsertLead(this.state.currentItem as ILeadItem);
      if (saved) {
        this.props.onSave();
      } else {
        this.setState({ valid: "There was an error saving the form. Please contact your administrator. Error details are in the browser console." });
      }
    } catch (err) {
      console.error(this.LOG_SOURCE, "(_formSave)", err);
    }
  }

  private _formCancel = (): void => {
    this.props.onClose();
  }

  private _resetValid = (): void => {
    try {
      const valid = this._formValid(this.state.currentItem as ILeadItem);
      this.setState({ valid });
    } catch (err) {
      console.error(this.LOG_SOURCE, "(_resetValid)", err);
    }
  }

  private _editMode = (): void => {
    try {
      this.setState({ changeMode: "edit" });
    } catch (err) {
      console.error(this.LOG_SOURCE, "(_resetValid)", err);
    }
  }

  public viewRender(): React.ReactElement<ILeadFormProps> | undefined {
    try {
      const statusItem = this._statusOptions.find((o) => { return o.Id === this.state.currentItem?.SLStatus });
      const installationType = this._installationTypeOptions.find((o) => { return o.Id === this.state.currentItem?.SLInstallationType });
      const financialPref = this._financingOptions.find((o) => { return o.Id === this.state.currentItem?.SLFinancingPreference });
      return (
        <>
          {this.props.source === "webpart" &&
            <div className="formtoolbar top">
              <HOOButton type={HOOButtonType.Standard} iconName="icon-edit-regular" label="Edit" onClick={this._editMode} />
              <HOOButton type={HOOButtonType.Primary} label="Close" onClick={this._formCancel} />
            </div>
          }
          {this.props.source !== "webpart" &&
            <div className="formtoolbar top">
              <HOOButton type={HOOButtonType.Primary} label="Close" onClick={this._formCancel} />
            </div>
          }
          <div className="mainform">
            <div className="formfield">
              <HOOLabel for={`${sl.instanceId}_title`} label="Title" />
              <HOOText
                readonly={true}
                inputElementAttributes={{ id: `${sl.instanceId}_title` } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                value={this.state.currentItem?.Title || ""}
                onChange={() => { }} />
            </div>
            <div className="formfield">
              <HOOLabel for={`${sl.instanceId}_status`} label="Status" />
              <NavItem item={statusItem} selected={true} index={0} onClick={() => { }} />
            </div>
            <div className="col-2">
              <div className="formfield">
                <HOOLabel for={`${sl.instanceId}_installationType`} label="Installation Type" />
                <NavItem item={installationType} selected={true} index={0} onClick={() => { }} />
              </div>
              <div className="formfield">
                <HOOLabel for={`${sl.instanceId}_market`} label="Market" />
                <HOOText
                  readonly={true}
                  inputElementAttributes={{ id: `${sl.instanceId}_market` } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                  value={this.state.currentItem?.SLMarket || ""}
                  onChange={() => { }} />
              </div>
            </div>
            <fieldset className="form-fieldset">
              <legend className="form-legend">Client Information</legend>
              <div className="col-2">
                <div className="formfield">
                  <HOOLabel for={`${sl.instanceId}_client`} label="Client" />
                  <HOOText
                    readonly={true}
                    inputElementAttributes={{ id: `${sl.instanceId}_client` } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                    value={this.state.currentItem?.SLClient || ""}
                    onChange={() => { }} />
                </div>
                <div className="formfield">
                  <HOOLabel for={`${sl.instanceId}_siteAddress`} label="Site Address" />
                  <HOOText
                    readonly={true}
                    inputElementAttributes={{ id: `${sl.instanceId}_siteAddress` } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                    value={this.state.currentItem?.SLSiteAddress || ""}
                    onChange={() => { }} />
                </div>
              </div>
              <div className="formfield">
                <HOOLabel for={`${sl.instanceId}_contact`} label="Name" />
                <HOOText
                  readonly={true}
                  inputElementAttributes={{ id: `${sl.instanceId}_contact` } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                  value={this.state.currentItem?.SLContact || ""}
                  onChange={() => { }} />
              </div>
              <div className="col-2">
                <div className="formfield">
                  <HOOLabel for={`${sl.instanceId}_contactEmail`} label="Email" />
                  {this.state.currentItem?.SLContactEmail
                    ? <a href={`mailto:${this.state.currentItem.SLContactEmail}`}>{this.state.currentItem.SLContactEmail}</a>
                    : <span />}
                </div>
                <div className="formfield">
                  <HOOLabel for={`${sl.instanceId}_contactPhone`} label="Phone" />
                  {this.state.currentItem?.SLContactPhone
                    ? <a href={`tel:${this.state.currentItem.SLContactPhone.replace(/[^+\d]/g, "")}`}>{this.state.currentItem.SLContactPhone}</a>
                    : <span />}
                </div>
              </div>
            </fieldset>
            <div className="formfield">
              <HOOLabel for={`${sl.instanceId}_leadSource`} label="Lead Source" />
              <HOOText
                readonly={true}
                inputElementAttributes={{ id: `${sl.instanceId}_leadSource` } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                value={this.state.currentItem?.SLLeadSource || ""}
                onChange={() => { }} />
            </div>
            <div className="col-2">
              <div className="formfield">
                <HOOLabel for={`${sl.instanceId}_utilityProvider`} label="Utility Provider" />
                <HOOText
                  readonly={true}
                  inputElementAttributes={{ id: `${sl.instanceId}_utilityProvider` } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                  value={this.state.currentItem?.SLUtilityProvider || ""}
                  onChange={() => { }} />
              </div>
              <div className="formfield">
                <HOOLabel for={`${sl.instanceId}_estimatedSystemSizeKW`} label="Estimated System Size (KW)" />
                <HOONumber
                  readonly={true}
                  inputElementAttributes={{ id: `${sl.instanceId}_estimatedSystemSizeKW` } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                  value={this.state.currentItem?.SLEstimatedSystemSizeKW || 0}
                  onChange={() => { }} />
              </div>
            </div>
            <div className="col-2">
              <div className="formfield">
                <HOOLabel for={`${sl.instanceId}_value`} label="Value" />
                <HOOText
                  readonly={true}
                  inputElementAttributes={{ id: `${sl.instanceId}_value` } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                  value={sl.currencyFormatter.format(this.state.currentItem?.SLValue || 0)}
                  onChange={() => { }} />
              </div>
              <div className="formfield">
                <HOOLabel for={`${sl.instanceId}_financingPreference`} label="Financing Preference" />
                <NavItem item={financialPref} selected={true} index={0} onClick={() => { }} />
              </div>
            </div>
            <div className="formfield">
              <HOOLabel for={`${sl.instanceId}_summary`} label="Summary" />
              <HOOText
                readonly={true}
                inputElementAttributes={{ id: `${sl.instanceId}_summary` } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                value={this.state.currentItem?.SLSummary || ""}
                multiline={3}
                onChange={() => { }} />
            </div>
            <div className="formfield">
              <HOOLabel for={`${sl.instanceId}_assignedTo`} label="Assigned To" />
              <UserLookup users={(this.state.currentItem?.SLAssignedTo as IUser) ? [this.state.currentItem?.SLAssignedTo as IUser] : undefined} enabled={false} addUser={() => { }} removeUser={() => { }} multiSelect={false} />
            </div>
          </div>
          <div className="sidebar">
            <div className="formfield">
              <HOOLabel for={`${sl.instanceId}_author`} label="Author" />
              <HOOText
                readonly={true}
                inputElementAttributes={{ id: `${sl.instanceId}_author` } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                value={this.state.currentItem?.Author?.Title || ""}
                onChange={() => { }} />
            </div>
            <div className="formfield">
              <HOOLabel for={`${sl.instanceId}_Created`} label="Created On" />
              <HOOText
                readonly={true}
                inputElementAttributes={{ id: `${sl.instanceId}_Created` } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                value={sl.dateFormatter.format(this.state.currentItem?.Created as Date) || ""}
                onChange={() => { }} />
            </div>
            <div className="formfield">
              <HOOLabel for={`${sl.instanceId}_editor`} label="Editor" />
              <HOOText
                readonly={true}
                inputElementAttributes={{ id: `${sl.instanceId}_editor` } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                value={this.state.currentItem?.Editor?.Title || ""}
                onChange={() => { }} />
            </div>
            <div className="formfield">
              <HOOLabel for={`${sl.instanceId}_Modified`} label="Modified On" />
              <HOOText
                readonly={true}
                inputElementAttributes={{ id: `${sl.instanceId}_Modified` } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                value={sl.dateFormatter.format(this.state.currentItem?.Modified as Date) || ""}
                onChange={() => { }} />
            </div>
          </div>
          <div className="formtoolbar bottom">
            <HOOButton type={HOOButtonType.Primary} label="Close" onClick={this._formCancel} />
          </div>
        </>
      )
    } catch (err) {
      console.error(this.LOG_SOURCE, "(viewRender)", err);
    }
  }

  public editRender(): React.ReactElement<ILeadFormProps> | undefined {
    try {
      return (
        <>
          <div className="formtoolbar top">
            <HOOButton type={HOOButtonType.Primary} label="Save" disabled={!this.state.dirty || this.state.valid.length > 0} onClick={this._formSave} />
            <HOOButton type={HOOButtonType.Standard} label="Cancel" disabled={false} onClick={this._formCancel} />
          </div>
          <div className="mainform">
            <div className="formfield error">
              <HOOLabel label={this.state.valid} rootElementAttributes={{ style: { color: "red" } }} />
              {this.state.valid.length > 0 &&
                <HOOButton type={HOOButtonType.Icon} iconName="hoo-icon-close" onClick={this._resetValid} />
              }
            </div>
            <div className="formfield">
              <HOOLabel for={`${sl.instanceId}_title`} label="Title" rootElementAttributes={{ className: "is-required" }} />
              <HOOText
                inputElementAttributes={{ id: `${sl.instanceId}_title`, required: true } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                value={this.state.currentItem?.Title || ""}
                onChange={(event) => { this._onChangeString("Title", event); }} />
            </div>
            <div className="formfield">
              <HOOLabel for={`${sl.instanceId}_status`} label="Status" rootElementAttributes={{ className: "is-required" }} />
              <NavSelector
                labelId={`${sl.instanceId}_status`}
                items={this._statusOptions}
                selectedKey={this.state.currentItem?.SLStatus || ""}
                selectionChanged={(fieldValue: string | number) => this._onChangeStringValue("SLStatus", fieldValue as string)} />
            </div>
            <div className="formfield">
              <HOOLabel for={`${sl.instanceId}_installationType`} label="Installation Type" />
              <NavSelector
                labelId={`${sl.instanceId}_installationType`}
                items={this._installationTypeOptions}
                selectedKey={this.state.currentItem?.SLInstallationType || ""}
                selectionChanged={(fieldValue: string | number) => this._onChangeStringValue("SLInstallationType", fieldValue as string)} />
            </div>
            <div className="formfield">
              <HOOLabel for={`${sl.instanceId}_market`} label="Market" />
              <HOODropDown
                inputElementAttributes={{ id: `${sl.instanceId}_market` } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                value={this.state.currentItem?.SLMarket || ""}
                options={[{ key: "", text: "<Unknown>" }, { key: "Northeast", text: "Northeast" }, { key: "Southeast", text: "Southeast" }, { key: "Midwest", text: "Midwest" }, { key: "Southwest", text: "Southwest" }, { key: "West Coast", text: "West Coast" }]}
                onChange={(fieldValue: string | number) => this._onChangeStringValue("SLMarket", fieldValue as string)} />
            </div>
            <fieldset className="form-fieldset">
              <legend className="form-legend">Client Information</legend>
              <div className="col-2">
                <div className="formfield">
                  <HOOLabel for={`${sl.instanceId}_client`} label="Client" />
                  <HOOText
                    inputElementAttributes={{ id: `${sl.instanceId}_client` } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                    value={this.state.currentItem?.SLClient || ""}
                    onChange={(event) => { this._onChangeString("SLClient", event); }} />
                </div>
                <div className="formfield">
                  <HOOLabel for={`${sl.instanceId}_siteAddress`} label="Site Address" />
                  <HOOText
                    inputElementAttributes={{ id: `${sl.instanceId}_siteAddress` } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                    value={this.state.currentItem?.SLSiteAddress || ""}
                    onChange={(event) => { this._onChangeString("SLSiteAddress", event); }} />
                </div>
              </div>
              <div className="formfield">
                <HOOLabel for={`${sl.instanceId}_contact`} label="Name" />
                <HOOText
                  inputElementAttributes={{ id: `${sl.instanceId}_contact` } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                  value={this.state.currentItem?.SLContact || ""}
                  onChange={(event) => { this._onChangeString("SLContact", event); }} />
              </div>
              <div className="col-2">
                <div className="formfield">
                  <HOOLabel for={`${sl.instanceId}_contactEmail`} label="Email" />
                  <HOOText
                    inputElementAttributes={{ id: `${sl.instanceId}_contactEmail`, placeholder: "name@domain.com" } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                    value={this.state.currentItem?.SLContactEmail || ""}
                    onChange={(event) => { this._onChangeString("SLContactEmail", event); }} />
                </div>
                <div className="formfield">
                  <HOOLabel for={`${sl.instanceId}_contactPhone`} label="Phone" />
                  <HOOText
                    inputElementAttributes={{ id: `${sl.instanceId}_contactPhone`, placeholder: "(123) 456-7890" } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                    value={this.state.currentItem?.SLContactPhone || ""}
                    onChange={(event) => { this._onChangeString("SLContactPhone", event); }} />
                </div>
              </div>
            </fieldset>
            <div className="formfield">
              <HOOLabel for={`${sl.instanceId}_leadSource`} label="Lead Source" />
              <HOODropDown
                inputElementAttributes={{ id: `${sl.instanceId}_leadSource` } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                value={this.state.currentItem?.SLLeadSource || ""}
                options={[{ key: "", text: "<Unknown>" }, { key: "Referral", text: "Referral" }, { key: "Website", text: "Website" }, { key: "Canvassing", text: "Canvassing" }, { key: "Partner", text: "Partner" }, { key: "Event", text: "Event" }, { key: "Cold Call", text: "Cold Call" }]}
                onChange={(fieldValue: string | number) => this._onChangeStringValue("SLLeadSource", fieldValue as string)} />
            </div>
            <div className="col-2">
              <div className="formfield">
                <HOOLabel for={`${sl.instanceId}_utilityProvider`} label="Utility Provider" />
                <HOOText
                  inputElementAttributes={{ id: `${sl.instanceId}_utilityProvider` } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                  value={this.state.currentItem?.SLUtilityProvider || ""}
                  onChange={(event) => { this._onChangeString("SLUtilityProvider", event); }} />
              </div>
              <div className="formfield">
                <HOOLabel for={`${sl.instanceId}_estimatedSystemSizeKW`} label="Estimated System Size (KW)" />
                <HOONumber
                  inputElementAttributes={{ id: `${sl.instanceId}_estimatedSystemSizeKW` } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                  value={this.state.currentItem?.SLEstimatedSystemSizeKW || 0}
                  onChange={(event) => { this._onChangeNumber("SLEstimatedSystemSizeKW", event); }} />
              </div>
            </div>
            <div className="col-2">
              <div className="formfield">
                <HOOLabel for={`${sl.instanceId}_value`} label="Value" />
                <HOONumber
                  inputElementAttributes={{ id: `${sl.instanceId}_value` } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                  inputPrefix="$"
                  value={this.state.currentItem?.SLValue || 0}
                  onChange={(event) => { this._onChangeNumber("SLValue", event); }} />
              </div>
              <div className="formfield">
                <HOOLabel for={`${sl.instanceId}_financingPreference`} label="Financing Preference" />
                <NavSelector
                  labelId={`${sl.instanceId}_financingPreference`}
                  items={this._financingOptions}
                  selectedKey={this.state.currentItem?.SLFinancingPreference || ""}
                  selectionChanged={(fieldValue: string | number) => this._onChangeStringValue("SLFinancingPreference", fieldValue as string)} />
              </div>
            </div>
            <div className="formfield">
              <HOOLabel for={`${sl.instanceId}_summary`} label="Summary" />
              <HOOText
                inputElementAttributes={{ id: `${sl.instanceId}_summary` } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                value={this.state.currentItem?.SLSummary || ""}
                multiline={3}
                onChange={(event) => { this._onChangeString("SLSummary", event); }} />
            </div>

            <div className="formfield">
              <HOOLabel for={`${sl.instanceId}_assignedTo`} label="Assigned To" />
              <UserLookup users={(this.state.currentItem?.SLAssignedTo as IUser) ? [this.state.currentItem?.SLAssignedTo as IUser] : undefined} enabled={true} addUser={(user: IUser) => { this._addUser(user, "SLAssignedTo") }} removeUser={(user: IUser) => { this._removeUser("SLAssignedTo") }} multiSelect={false} />
            </div>
          </div>
          {this.props.mode === "edit" &&
            <>
              <aside className="sidebar">
                <div className="formfield">
                  <HOOLabel for={`${sl.instanceId}_author`} label="Author" />
                  <HOOText
                    readonly={true}
                    inputElementAttributes={{ id: `${sl.instanceId}_author` } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                    value={this.state.currentItem?.Author?.Title || ""}
                    onChange={() => { }} />
                </div>
                <div className="formfield">
                  <HOOLabel for={`${sl.instanceId}_Created`} label="Created On" />
                  <HOOText
                    readonly={true}
                    inputElementAttributes={{ id: `${sl.instanceId}_Created` } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                    value={sl.dateFormatter.format(this.state.currentItem?.Created as Date) || ""}
                    onChange={() => { }} />
                </div>
                <div className="formfield">
                  <HOOLabel for={`${sl.instanceId}_editor`} label="Editor" />
                  <HOOText
                    readonly={true}
                    inputElementAttributes={{ id: `${sl.instanceId}_editor` } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                    value={this.state.currentItem?.Editor?.Title || ""}
                    onChange={() => { }} />
                </div>
                <div className="formfield">
                  <HOOLabel for={`${sl.instanceId}_Modified`} label="Modified On" />
                  <HOOText
                    readonly={true}
                    inputElementAttributes={{ id: `${sl.instanceId}_Modified` } as React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>}
                    value={sl.dateFormatter.format(this.state.currentItem?.Modified as Date) || ""}
                    onChange={() => { }} />
                </div>
              </aside>
            </>
          }
          <div className="formtoolbar bottom">
            <HOOButton type={HOOButtonType.Primary} label="Save" disabled={!this.state.dirty || this.state.valid.length > 0} onClick={this._formSave} />
            <HOOButton type={HOOButtonType.Standard} label="Cancel" disabled={false} onClick={this._formCancel} />
          </div>
        </>
      )
    } catch (err) {
      console.error(this.LOG_SOURCE, "(editRender)", err);
    }
  }

  public render(): React.ReactElement<ILeadFormProps> | undefined {
    try {
      return (
        <div className="listform-container">
          <div data-component={this.LOG_SOURCE} className="listform">
            {(this.state.changeMode || this.props.mode) === "view" &&
              this.viewRender()
            }
            {((this.state.changeMode || this.props.mode) === "new" || (this.state.changeMode || this.props.mode) === "edit") &&
              this.editRender()
            }
          </div>
        </div>
      );
    } catch (err) {
      console.error(this.LOG_SOURCE, "(render)", err);
      return;
    }
  }
}