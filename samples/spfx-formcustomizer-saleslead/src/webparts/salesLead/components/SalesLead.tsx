import * as React from "react";
import styles from "./SalesLead.module.scss";
import { ILeadItem } from "../../../common/services/models";
import LeadForm from "../../../common/components/molecules/LeadForm";
import LeadsList from "../../../common/components/molecules/LeadsList";
import HOOCommandBar, { IHOOCommandItem } from "@n8d/htwoo-react/HOOCommandBar";
import { IHOOFlyoutMenuItem } from "@n8d/htwoo-react";
import { sl } from "../../../common/services/slService";
import NavSelector, { ISelectorObj } from "../../../common/components/atoms/NavSelector";

export interface ISalesLeadProps {
  mode: "crud" | "statusleads";
  crudType: "view" | "edit" | "new" | undefined;
  leadStatus: "status-lead" | "status-site-survey" | "status-proposal" | "status-won" | "status-lost" | undefined;
  data: ILeadItem | ILeadItem[];
}

export interface ISalesLeadState {
  selectedMode: "crud" | "statusleads";
  selectedCrudType: "view" | "edit" | "new" | undefined;
  selectedLeadStatus: "status-lead" | "status-site-survey" | "status-proposal" | "status-won" | "status-lost" | undefined;
  item: ILeadItem | undefined;
  items: ILeadItem[] | undefined;
  filterKey: string;
}

export class SalesLeadState implements ISalesLeadState {
  public constructor(
    public selectedMode: "crud" | "statusleads" = "crud",
    public selectedCrudType: "view" | "edit" | "new" | undefined = undefined,
    public selectedLeadStatus: "status-lead" | "status-site-survey" | "status-proposal" | "status-won" | "status-lost" | undefined = undefined,
    public items: ILeadItem[] | undefined = undefined,
    public item: ILeadItem | undefined = undefined,
    public filterKey: string = "all"
  ) { }
}

/**
 * Main container component for the Sales Lead System web part.
 *
 * **Dual-mode architecture:** The component operates in one of two display modes,
 * tracked in `state.selectedMode`:
 * - `"statusleads"` — Renders `LeadsList` showing all leads, optionally filtered by
 *   `SLStatus`. The `_filterLeads()` method updates the displayed items.
 * - `"crud"` — Renders `LeadForm` for viewing, editing, or creating a single lead.
 *   `state.selectedCrudType` (`"view"` | `"edit"` | `"new"`) controls the form mode.
 *
 * **Navigation contract:** `_showItem(index)` transitions list → form by calling
 * `sl.SelectLead(index)` and setting `selectedMode: "crud"`. `_showList()` transitions
 * back from form → list. This keeps the parent web part stateless with respect to
 * in-page navigation.
 *
 * **Initial state:** `props.mode` and `props.crudType` seed the initial state via the
 * `SalesLeadState` constructor. After that, `setState` drives all navigation — props are
 * not re-read for navigation purposes.
 */
export default class SalesLead extends React.PureComponent<ISalesLeadProps, ISalesLeadState> {
  private LOG_SOURCE = "🟢SalesLead";
  private _commandItems: IHOOCommandItem[];
  private _statusOptions: ISelectorObj[] = [
    { Id: 'all', IconName: 'icon-filter-dismiss-regular', DisplayName: 'All', ColorIndex: 6 },
    { Id: 'status-lead', IconName: 'status-lead', DisplayName: 'Lead', ColorIndex: 5 },
    { Id: 'status-site-survey', IconName: 'status-site-survey', DisplayName: 'Site Survey', ColorIndex: 2 },
    { Id: 'status-proposal', IconName: 'status-proposal', DisplayName: 'Proposal', ColorIndex: 3 },
    { Id: 'status-won', IconName: 'status-won', DisplayName: 'Won', ColorIndex: 1 },
    { Id: 'status-lost', IconName: 'status-lost', DisplayName: 'Lost', ColorIndex: 4 }
  ]

  public constructor(props: ISalesLeadProps) {
    super(props);
    this._commandItems = [{ flyoutMenuItems: [], key: 1, text: "Add New Lead" }];
    const items = props.mode === "statusleads" ? props.data as ILeadItem[] : undefined;
    const item = props.mode === "crud" ? props.data as ILeadItem : undefined;
    this.state = new SalesLeadState(props.mode, props.crudType, props.leadStatus, items, item, props.leadStatus || "all");
  }

  private _showItem = (index: number): void => {
    try {
      sl.SelectLead(index);
      this.setState({ item: sl.selectedItem, selectedMode: "crud", selectedCrudType: "view" });
    } catch (err) {
      console.error(this.LOG_SOURCE, "(_showItem)", err);
    }
  }

  private _showList(): void {
    try {
      this.setState({ item: undefined, selectedMode: "statusleads", selectedCrudType: undefined });
    } catch (err) {
      console.error(this.LOG_SOURCE, "(_showList)", err);
    }
  }
  private _onSave = async (): Promise<void> => {
    this._showList();
  }

  private _onClose = async (): Promise<void> => {
    this._showList();
  }

  private _leadsMenu = (ev: React.MouseEvent<HTMLElement>, commandKey: number | string, flyoutItem: IHOOFlyoutMenuItem): void => {
    try {
      if ((commandKey as number) === 1) {
        sl.AddLead();
        this.setState({ item: sl.selectedItem, selectedMode: "crud", selectedCrudType: "new" });
      }
    } catch (err) {
      console.error(this.LOG_SOURCE, "(_filterLeads)", err);
    }
  }

  private _filterLeads = (fieldValue: string | number): void => {
    try {
      let items: ILeadItem[];
      const filterKey: string = fieldValue as string;
      if (fieldValue === 'all') {
        items = structuredClone(this.props.data as ILeadItem[]);
      } else {
        items = (this.props.data as ILeadItem[]).filter((o) => { return o.SLStatus === fieldValue });
      }
      this.setState({ items, filterKey });
    } catch (err) {
      console.error(this.LOG_SOURCE, "(_filterLeads)", err);
    }
  }

  public render(): React.ReactElement<ISalesLeadProps> | undefined {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className={styles.salesLead}>
          {this.state.selectedMode === "crud" &&
            (this.props.crudType !== undefined || this.state.selectedCrudType !== undefined) &&
            this.state.item !== undefined &&
            <LeadForm
              source="webpart"
              mode={this.state.selectedCrudType || this.props.crudType}
              item={this.state.item}
              onSave={this._onSave}
              onClose={this._onClose} />
          }
          {this.state.selectedMode === "statusleads" && this.state.items !== undefined &&
            <>
              <div className="toolbar">
                <div>
                  <HOOCommandBar commandItems={this._commandItems} onClick={this._leadsMenu} hasOverflow={true} />
                  <NavSelector
                    labelId={`${sl.instanceId}_status`}
                    items={this._statusOptions}
                    selectedKey={this.state.filterKey}
                    selectionChanged={this._filterLeads} />
                </div>
              </div>
              <LeadsList items={this.state.items} onNav={this._showItem} />
            </>
          }
        </div>
      );
    } catch (err) {
      console.error(this.LOG_SOURCE, "(render)", err);
      return;
    }
  }
}