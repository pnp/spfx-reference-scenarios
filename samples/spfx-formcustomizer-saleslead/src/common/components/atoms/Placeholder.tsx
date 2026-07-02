import * as React from "react";
import HOOShimmer, { HOOShimmerShape, HOOShimmerTheme } from "@n8d/htwoo-react/HOOShimmer";
import styles from "../../../webparts/salesLead/components/SalesLead.module.scss";

export interface IPlaceholderProps {
}

export interface IPlaceholderState {
}

export class PlaceholderState implements IPlaceholderState {
  public constructor() { }
}

export default class Placeholder extends React.PureComponent<IPlaceholderProps, IPlaceholderState> {
  private LOG_SOURCE = "🟢Placeholder";

  public constructor(props: IPlaceholderProps) {
    super(props);
    this.state = new PlaceholderState();
  }

  public render(): React.ReactElement<IPlaceholderProps> | undefined {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className={styles.salesLead}>
          <HOOShimmer shape={HOOShimmerShape.Container} theme={HOOShimmerTheme.Neutral}>
            <HOOShimmer shape={HOOShimmerShape.Row} theme={HOOShimmerTheme.Neutral} />
          </HOOShimmer>
        </div>
      );
    } catch (err) {
      console.error(this.LOG_SOURCE, "(render)", err);
      return;
    }
  }
}