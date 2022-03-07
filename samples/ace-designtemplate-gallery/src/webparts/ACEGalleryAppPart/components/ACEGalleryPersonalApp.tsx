import * as React from 'react';
import styles from './AceDesignTemplatePersonalApp.module.scss';
import { Logger, LogLevel } from "@pnp/logging";
import { AppData, DeepLinkData } from '../../../common/models/designtemplate.models';
import AppDetails from './organisms/AppDetails';
import AppList from './organisms/AppList';
import { IMicrosoftTeams } from '@microsoft/sp-webpart-base';

export interface IACEGalleryPersonalAppProps {
  appData: AppData;
  deepLink: DeepLinkData;
  appList: AppData[];
}

export interface IACEGalleryPersonalAppState {
  appData: AppData;
  deepLink: DeepLinkData;
}

export class ACEGalleryPersonalAppState implements IACEGalleryPersonalAppState {
  constructor(
    public appData: AppData = new AppData(),
    public deepLink: DeepLinkData = null

  ) { }
}



export default class ACEGalleryPersonalApp extends React.Component<IACEGalleryPersonalAppProps, ACEGalleryPersonalAppState> {
  private LOG_SOURCE: string = "🔶 ACEGalleryPersonalApp";

  constructor(props: IACEGalleryPersonalAppProps) {
    super(props);
    try {
      this.state = new ACEGalleryPersonalAppState(this.props.appData, this.props.deepLink);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (constructor) - ${err}`, LogLevel.Error);
    }
  }

  private _onCardClick = (selectedApp: AppData) => {
    try {

      this.setState({ appData: selectedApp });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onCardClick) - ${err}`, LogLevel.Error);
    }
  }

  private _onBackClick = () => {
    try {
      this.setState({ appData: null, deepLink: null });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onBackClick) - ${err}`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<IACEGalleryPersonalAppProps> {
    return (
      <div className={styles.aceDesignTemplatePersonalApp}>
        {this.state.appData &&
          <AppDetails appData={this.state.appData} deepLink={this.state.deepLink} onBackClick={this._onBackClick}></AppDetails>
        }
        {!this.state.appData &&
          <AppList appList={this.props.appList} onCardClick={this._onCardClick}></AppList>
        }

      </div>
    );
  }
}
