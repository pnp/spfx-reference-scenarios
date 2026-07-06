import * as React from "react";

import styles from "./SalesLeadForm.module.scss";
import LeadForm from "../../../common/components/molecules/LeadForm";
import { FormDisplayMode } from "@microsoft/sp-core-library";
import { sl } from '../../../common/services/slService';

export interface ISalesLeadFormProps {
  displayMode: FormDisplayMode;
  onSave: () => void;
  onClose: () => void;
}

export interface ISalesLeadFormState {
}

export class SalesLeadFormState implements ISalesLeadFormState {
  public constructor() { }
}

export default class SalesLeadForm extends React.PureComponent<ISalesLeadFormProps, ISalesLeadFormState> {
  private LOG_SOURCE = "🟢SalesLeadForm";

  public constructor(props: ISalesLeadFormProps) {
    super(props);
    this.state = new SalesLeadFormState();
  }

  public render(): React.ReactElement<ISalesLeadFormProps> | undefined {
    try {
      const mode = (this.props.displayMode === FormDisplayMode.Display) ? "view" : ((this.props.displayMode === FormDisplayMode.Edit) ? "edit" : "new");
      return (
        <div data-component={this.LOG_SOURCE} className={styles.salesLeadForm}>
          <LeadForm source="form" mode={mode} item={sl.selectedItem} onSave={this.props.onSave} onClose={this.props.onClose} />
        </div>
      );
    } catch (err) {
      console.error(this.LOG_SOURCE, "(render)", err);
      return;
    }
  }
}