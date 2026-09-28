import * as React from 'react';
import styles from './AceDesignTemplatePersonalApp.module.scss';
import { AppData, DeepLinkData } from '../../../common/models/designtemplate.models';
import AppDetails from './organisms/AppDetails';
import AppList from './organisms/AppList';

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
  private LOG_SOURCE = "🔶 ACEGalleryPersonalApp";

  constructor(props: IACEGalleryPersonalAppProps) {
    super(props);
    try {
      this.state = new ACEGalleryPersonalAppState(this.props.appData, this.props.deepLink);
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (constructor) - ${err}`
      );
    }
  }

  private _onCardClick = (selectedApp: AppData) => {
    try {

      this.setState({ appData: selectedApp });
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (_onCardClick) - error clicking app card ${err}`
      );
    }
  }

  private _onBackClick = () => {
    try {
      this.setState({ appData: null, deepLink: null });
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (_onBackClick) - error clicking app card ${err}`
      );
    }
  }

  public render(): React.ReactElement<IACEGalleryPersonalAppProps> {
    return (
      <div className={styles.aceDesignTemplatePersonalApp}>
        {this.state.appData &&
          <AppDetails appData={this.state.appData} deepLink={this.state.deepLink} onBackClick={this._onBackClick} />
        }
        {!this.state.appData &&
          <AppList appList={this.props.appList} onCardClick={this._onCardClick} />
        }

      </div>
    );
  }
}
