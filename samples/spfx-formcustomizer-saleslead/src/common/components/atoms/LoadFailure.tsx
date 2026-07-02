import * as React from "react";
import styles from "../../../webparts/salesLead/components/SalesLead.module.scss";

export interface ILoadFailureProps {
}

export interface ILoadFailureState {
}

export class LoadFailureState implements ILoadFailureState {
  public constructor() { }
}

export default class LoadFailure extends React.PureComponent<ILoadFailureProps, ILoadFailureState> {
  private LOG_SOURCE = "🟢LoadFailure";

  public constructor(props: ILoadFailureProps) {
    super(props);
    this.state = new LoadFailureState();
  }

  public render(): React.ReactElement<ILoadFailureProps> | undefined {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className={styles.salesLead}>
          <p>Unable to load this solution. Please contact and administrator and see the browser console logs for more details</p>
        </div>
      );
    } catch (err) {
      console.error(this.LOG_SOURCE, "(render)", err);
      return;
    }
  }
}