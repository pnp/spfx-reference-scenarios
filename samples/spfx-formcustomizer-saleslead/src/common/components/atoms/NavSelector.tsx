import * as React from "react";
import NavItem from "./NavItem";

export interface ISelectorObj {
  Id: number | string;
  IconName: string;
  DisplayName: string;
  ColorIndex?: number;
}

export interface INavSelectorProps {
  labelId?: string;
  items: ISelectorObj[];
  selectedKey: number | string;
  selectionChanged: (key: number | string) => void;
}

export interface INavSelectorState {
}

export class NavSelectorState implements INavSelectorState {
  public constructor() { }
}

/**
 * Renders a horizontal row of toggle buttons from an `ISelectorObj` array, highlighting
 * the button whose `Id` matches `props.selectedKey`. Used for single-selection among a
 * fixed set of labelled options such as pipeline status, installation type, and financing
 * preference. Each button click calls `props.selectionChanged` with the selected item's `Id`.
 */
export default class NavSelector extends React.PureComponent<INavSelectorProps, INavSelectorState> {
  private LOG_SOURCE = "🟢NavSelector";

  public constructor(props: INavSelectorProps) {
    super(props);
    this.state = new NavSelectorState();
  }

  public render(): React.ReactElement<INavSelectorProps> | undefined {
    try {
      return (
        <nav data-component={this.LOG_SOURCE} className="nav-selector-select" role="toolbar" aria-labelledby={this.props.labelId}>
          {this.props.items && this.props.items.map((i, idx) => {
            const selected = (i.Id === this.props.selectedKey)
            return (
              <NavItem key={idx} index={idx} item={i} selected={selected} onClick={() => this.props.selectionChanged(i.Id)} />
            );
          })}
        </nav>
      );
    } catch (err) {
      console.error(this.LOG_SOURCE, "(render)", err);
      return;
    }
  }
}