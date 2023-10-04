import * as React from 'react';
import styles from './ConsumeMiddleware.module.scss';
import type { IConsumeMiddlewareProps } from './IConsumeMiddlewareProps';
import type { IConsumeMiddlewareState } from './IConsumeMiddlewareState';

import { Placeholder } from "@pnp/spfx-controls-react/lib/Placeholder";
import { PrimaryButton } from 'office-ui-fabric-react';
import { AadHttpClient, IHttpClientOptions } from '@microsoft/sp-http';

export default class ConsumeMiddleware extends React.Component<IConsumeMiddlewareProps, IConsumeMiddlewareState> {

  public constructor(props: IConsumeMiddlewareProps) {
    super(props);
    
    this.state = {
      apiDescription: '',
      errorMessage: ''
    };
  }

  public render(): React.ReactElement<IConsumeMiddlewareProps> {
    const {
      middlewareUrl,
      isDarkTheme,
      hasTeamsContext
    } = this.props;

    const {
      apiDescription,
      userPrincipalName,
      webSiteTitle,
      errorMessage
    } = this.state;

    console.log(this.state);

    return (
      <section className={`${styles.consumeMiddleware} ${hasTeamsContext ? styles.teams : ''}`}>
        { !middlewareUrl && 
          <Placeholder iconName='Edit'
            iconText='Configure your web part'
            description='Please configure the web part.'
            buttonLabel='Configure'
            onConfigure={this.props.onConfigure} /> 
        }
        { middlewareUrl &&
          <div>
            <div className={styles.welcome}>
              <img alt="" src={isDarkTheme ? require('../assets/welcome-dark.png') : require('../assets/welcome-light.png')} className={styles.welcomeImage} />
              <h2>Welcome to the Middleware Consumer Web Part!</h2>
            </div>
            <div className={styles.resultingData}>
              <div className={styles.commandButton}>
                <PrimaryButton text="Consume SharePoint and Microsoft Graph via middleware with OBO" onClick={this._consumeMiddlewareWithOBO} />
              </div>
              <div className={styles.resultingData}>
                { userPrincipalName && <div><div>{apiDescription}</div><div>You are {userPrincipalName} and you are on SharePoint Online site with title &quot;{webSiteTitle}&quot;!</div></div> }
              </div>
            </div>
            { errorMessage && <div className={styles.errorMessage}>{errorMessage}</div> }
          </div>
        }
      </section>
    );
  }

  private _consumeMiddlewareWithOBO = async (): Promise<void> => {
    const {
      middlewareUrl,
      middlewareClient,
    } = this.props;

    try {
      const getApiUrl = `${middlewareUrl}${middlewareUrl.charAt(middlewareUrl.length - 1) === '/' ? '': '/'}consumeWithOBO`;

      const requestHeaders: Headers = new Headers();
      requestHeaders.append('Content-type', 'application/json');
  
      const requestMessage: IHttpClientOptions = {
        body: JSON.stringify({
          tenantName: this.props.tenantName,
          siteRelativeUrl: this.props.siteRelativeUrl
        }),
        headers: requestHeaders
      }

      const response = await middlewareClient.post(getApiUrl, AadHttpClient.configurations.v1, requestMessage);
      const data = await response.json();
  
      this.setState({
        apiDescription: "Middleware via OBO",
        userPrincipalName: data.userPrincipalName,
        webSiteTitle: data.webSiteTitle
      });
    } catch (ex) {
      this.setState({
        errorMessage: ex
      });
    }
  }
}
