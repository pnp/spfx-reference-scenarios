import * as React from "react";
import { isEqual } from "@microsoft/sp-lodash-subset";

export interface IInventoryItemProps {
  introText: string;
  label: string;
  value: string;
}

export interface IInventoryItemState {
}

export class InventoryItemState implements IInventoryItemState {
  constructor() { }
}

export default class InventoryItem extends React.Component<IInventoryItemProps, IInventoryItemState> {
  private LOG_SOURCE: string = "🔶 InventoryItem";

  constructor(props: IInventoryItemProps) {
    super(props);
    this.state = new InventoryItemState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IInventoryItemProps>, nextState: Readonly<IInventoryItemState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IInventoryItemProps> {
    try {
      return (
        <div className="deepLinkCard" data-component={this.LOG_SOURCE}>
          <div className="introText">{this.props.introText}</div>
          <span><span className="linkCardLabel">{`${this.props.label}: `}</span>{this.props.value}</span>
        </div>
      );
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (render) - error rendering component ${err}`
      );
      return null;
    }
  }
}