import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "lodash";
import { cs } from "../../../common/covid.service";
import { ICheckIns, CheckInMode } from "../../../common/covid.model";
import CovidForm from "../../../common/components/CovidForm";

export enum ADMINTABS {
  "TODAY",
  "GUEST"
}
export interface ICovidAdminProps {
  loginName: string;
  displayName: string;
  userId?: number;
}

export interface ICovidAdminState {
  tab: ADMINTABS;
  checkIns: ICheckIns[];
}

export class CovidAdminState implements ICovidAdminState {
  constructor(
    public checkIns: ICheckIns[] = [],
    public tab: ADMINTABS = ADMINTABS.TODAY
  ) { }
}

export default class CovidAdmin extends React.Component<ICovidAdminProps, ICovidAdminState> {
  private LOG_SOURCE: string = "🔶CovidAdmin";

  constructor(props: ICovidAdminProps) {
    super(props);
    this.state = new CovidAdminState();
  }

  public componentDidMount() {
    this.setState({ checkIns: cs.CheckIns });
    cs.CheckInsRefresh = this._updateCheckIns;
  }

  public shouldComponentUpdate(nextProps: ICovidAdminProps, nextState: ICovidAdminState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _updateCheckIns = () => {
    this.setState({ checkIns: cs.CheckIns });
  }

  private _changeTab = (newTab: ADMINTABS): void => {
    this.setState({ tab: newTab });
  }

  public render(): React.ReactElement<ICovidAdminProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE}>
          <div>
            <div onClick={() => this._changeTab(ADMINTABS.TODAY)}>TODAY</div>
            <div onClick={() => this._changeTab(ADMINTABS.GUEST)}>GUEST</div>
          </div>
          {this.state.tab === ADMINTABS.TODAY &&
            <div>
              {this.state.checkIns.map((ci) => {
                return (
                  <div key={ci.Id}>
                    <span>{ci.Id}</span>
                    <span>{ci.Employee?.Title || ci.Guest}</span>
                    <span>{ci.SubmittedOn || ci.Created}</span>
                  </div>
                );
              })}
            </div>
          }
          {this.state.tab === ADMINTABS.GUEST &&
            <CovidForm loginName={this.props.loginName} displayName={this.props.displayName} userId={this.props.userId} checkInMode={CheckInMode.Guest} />
          }
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}