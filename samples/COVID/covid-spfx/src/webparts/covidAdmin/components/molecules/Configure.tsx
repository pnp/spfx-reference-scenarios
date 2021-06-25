import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";

import { configureImage } from "../../assets/images";
import strings from "CovidWebPartStrings";
import Button from "../atoms/Button";

export interface IConfigureProps {
  startConfigure: (demoData: boolean) => void;
}

export interface IConfigureState {
  working: boolean;
}

export class ConfigureState implements IConfigureState {
  constructor(
    public working: boolean = false
  ) { }
}

export default class Configure extends React.Component<IConfigureProps, IConfigureState> {
  private LOG_SOURCE: string = "🔶Configure";

  constructor(props: IConfigureProps) {
    super(props);
    this.state = new ConfigureState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IConfigureProps>, nextState: Readonly<IConfigureState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _startConfigure = (demoData: boolean) => {
    this.setState({ working: true }, () => {
      this.props.startConfigure(demoData);
    });
  }

  public render(): React.ReactElement<IConfigureProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className={`covidAdmin hoo-splashscr`}>
          <div className="hoo-splashscr-content">
            <article className="hoo-splashcard">
              <header className="hoo-splashcard-header" role="presentation">
                <img src={configureImage} className="hoo-splashcard-img" />
              </header>
              <h1 className="hoo-splashcard-title">
                {strings.ConfigurationTitle}
              </h1>
              <p className="hoo-splashcard-desc">
                {strings.ConfigurationNeeded}
              </p>
              <footer className="hoo-splashcard-footer">
                <Button className="hoo-button-primary" disabled={this.state.working} label={strings.ConfigureNow} onClick={() => this._startConfigure(false)} />
                <Button className="hoo-button" disabled={this.state.working} label={strings.ConfigureNowData} onClick={() => this._startConfigure(true)} />
              </footer>
            </article>
          </div>
          {this.state.working &&
            <div className="loaderContainer"><div className="loader"></div></div>
          }
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}