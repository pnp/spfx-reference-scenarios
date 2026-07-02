import * as React from "react";
import { ISelectorObj } from "./NavSelector";
import HOOIcon from "@n8d/htwoo-react/HOOIcon";

export interface INavItemProps {
  index: number;
  item: ISelectorObj | undefined;
  selected: boolean;
  onClick: () => void;
}

export interface INavItemState {
}

export class NavItemState implements INavItemState {
  public constructor() { }
}

/**
 * A single toggle button that displays an icon and label from an `ISelectorObj`.
 * Sets `aria-pressed` to communicate selection state to assistive technologies.
 * When `props.item` is undefined (e.g. a lead field with no value set) it renders a
 * fallback "Not Set" button with a question-mark icon so the UI never breaks.
 *
 * The CSS class `nav-selector button{ColorIndex}` applies a colour from the design
 * system's index, giving each option in a `NavSelector` a distinct visual identity.
 */
export default class NavItem extends React.PureComponent<INavItemProps, INavItemState> {
  private LOG_SOURCE = "🟢NavItem";

  public constructor(props: INavItemProps) {
    super(props);
    this.state = new NavItemState();
  }

  public render(): React.ReactElement<INavItemProps> | undefined {
    try {
      return (
        <>
          {this.props.item &&
            <button data-component={this.LOG_SOURCE}
              type="button"
              className={`nav-selector button${this.props.item.ColorIndex || this.props.index}`}
              title={this.props.item.DisplayName}
              aria-label={this.props.item.DisplayName}
              aria-pressed={this.props.selected}
              onClick={this.props.onClick}>
              <HOOIcon iconName={this.props.item.IconName} />
              <span>{this.props.item.DisplayName}</span>
            </button>
          }
          {!this.props.item &&
            <button data-component={this.LOG_SOURCE}
              type="button"
              className={`nav-selector button1`}
              title="Not Set"
              aria-label="Not Set"
              aria-pressed={false}
              onClick={this.props.onClick}>
              <HOOIcon iconName="icon-shield-question-regular" />
              <span>Not Set</span>
            </button>
          }
        </>
      );
    } catch (err) {
      console.error(this.LOG_SOURCE, "(render)", err);
      return;
    }
  }
}