import * as React from "react";
import HOOIcon from "@n8d/htwoo-react/HOOIcon";

export interface ILinkItemProps {
  idx: number;
  title: string;
  description: string;
  image?: string;
  onNav: () => void;
}

export interface ILinkItemState {
}

/**
 * A clickable card that represents a single lead in the `LeadsList` grid.
 * Renders as an anchor element for accessibility and keyboard navigation, but intercepts
 * the click via `_openLink` to call `props.onNav` rather than follow an href.
 * Displays the lead's status icon (from `props.image`), title, and a description line.
 */
export default class LinkItem extends React.PureComponent<ILinkItemProps, ILinkItemState> {
  private LOG_SOURCE = "🟢LinkItem";

  public constructor(props: ILinkItemProps) {
    super(props);
    this.state = {};
  }

  private _openLink = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    try {
      e.cancelable = true;
      e.stopPropagation();
      this.props.onNav()
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (_openLink) - ${err}`);
    }
  }

  public render(): React.ReactElement<ILinkItemProps> | undefined {
    try {
      return (
        <a data-component={this.LOG_SOURCE}
          data-index={this.props.idx}
          className="ql-link"
          target="_blank"
          rel="noreferrer"
          onClick={this._openLink}>
          <div className="ql-list">
            <figure className="media">
              {this.props.image && this.props.image.length > 0 &&
                <HOOIcon iconName={this.props.image} rootElementAttributes={{ "className": `media-svg ${this.props.image}` }} />
              }
            </figure>
            <div className="ql-info">
              <div className="ql-title">
                {this.props.title || "<undefined>"}
              </div>
              <div className="ql-desc">
                {this.props.description || <>&nbsp;</>}
              </div>
            </div>
          </div>
        </a >
      );
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (render) - ${err}`);
      return;
    }
  }
}