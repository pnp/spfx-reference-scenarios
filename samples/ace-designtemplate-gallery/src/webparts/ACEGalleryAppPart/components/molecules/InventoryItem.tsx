import * as React from "react";

export interface IInventoryItemProps {
  introText: string;
  label: string;
  value: string;
}

export default class InventoryItem extends React.Component<IInventoryItemProps> {
  private LOG_SOURCE = "🔶 InventoryItem";

  constructor(props: IInventoryItemProps) {
    super(props);
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