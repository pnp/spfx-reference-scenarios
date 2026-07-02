import * as React from "react";
import { ILeadItem } from "../../services/models";
import LinkItem from "../atoms/LinkItem";

export interface ILeadsListProps {
  items: ILeadItem[];
  onNav: (index: number) => void;
}

export interface ILeadsListState {
}

export class LeadsListState implements ILeadsListState {
  public constructor() { }
}

export default class LeadsList extends React.PureComponent<ILeadsListProps, ILeadsListState> {
  private LOG_SOURCE = "🟢LeadsList";

  public constructor(props: ILeadsListProps) {
    super(props);
    this.state = new LeadsListState();
  }

  public render(): React.ReactElement<ILeadsListProps> | undefined {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className="tool-grid-container">
          <div className="tool-grid">
            {this.props.items && this.props.items.map((li: ILeadItem, idx: number) => {
              return (
                <LinkItem key={idx}
                  idx={idx}
                  title={li.Title}
                  description={`${li.SLClient} - ${li.SLContact}`}
                  image={li.SLStatus}
                  onNav={() => { this.props.onNav(idx) }}
                />
              );
            })}
          </div>
        </div>
      );
    } catch (err) {
      console.error(this.LOG_SOURCE, "(render)", err);
      return;
    }
  }
}