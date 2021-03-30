import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "lodash";

export interface ICovidAdminProps {
}

export interface ICovidAdminState {
}

export class CovidAdminState implements ICovidAdminState {
  constructor() { }
}

export default class CovidAdmin extends React.Component<ICovidAdminProps, ICovidAdminState> {
  private LOG_SOURCE: string = "🔶CovidAdmin";

  constructor(props: ICovidAdminProps) {
    super(props);
    this.state = new CovidAdminState();
  }

  public shouldComponentUpdate(nextProps: ICovidAdminProps, nextState: ICovidAdminState) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ICovidAdminProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE}>
          <a href="https://a830edad9050849spodk2100036.sharepoint.com/sites/COVID/SitePages/Covid-Check-In.aspx?g=1">Check In Guest</a>
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}