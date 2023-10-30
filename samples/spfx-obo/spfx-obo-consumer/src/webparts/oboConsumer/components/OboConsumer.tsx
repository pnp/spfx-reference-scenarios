import * as React from 'react';
import styles from './OboConsumer.module.scss';
import { IOboConsumerProps } from './IOboConsumerProps';
import { IOboConsumerState } from './IOboConsumerState';

import { Placeholder } from "@pnp/spfx-controls-react/lib/Placeholder";
import { DefaultButton, PrimaryButton, TextField } from 'office-ui-fabric-react';
import { AadHttpClient, IHttpClientOptions } from '@microsoft/sp-http';

import { PeoplePicker } from '@microsoft/mgt-react/dist/es6/spfx';
import { PersonType } from '@microsoft/mgt-spfx';

export default class OboConsumer extends React.Component<IOboConsumerProps, IOboConsumerState> {

  public constructor(props: IOboConsumerProps) {
    super(props);
    
    this.state = {
      errorMessage: ''
    };
  }

  public render(): React.ReactElement<IOboConsumerProps> {
    const {
      middlewareUrl,
      hasTeamsContext,
      isDarkTheme
    } = this.props;

    const {
      userPrincipalName,
      inboxUnreadItemCount,
      inboxTotalItemCount,
      errorMessage
    } = this.state;

    return (
      <section className={`${styles.oboConsumer} ${hasTeamsContext ? styles.teams : ''}`}>
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
              <h2>Welcome to the OBO Consumer Web Part!</h2>
            </div>
            <div className={styles.personalData}>
              <PrimaryButton text="Get my personal data via OBO" onClick={this._getPersonalData} />
              { userPrincipalName && <div>You are {userPrincipalName} and you have {inboxUnreadItemCount} unread out of {inboxTotalItemCount} in your inbox!</div> }
            </div>
            <div className={styles.chatMessage}>
              <PeoplePicker type={PersonType.person} showMax={1}
                selectionChanged={this._onPeoplePickerSelectionChanged} />
              <TextField label="Write the content of the chat message" multiline autoAdjustHeight onChange={this._onMessageChanged} />
              <DefaultButton text="Send Teams chat message via OBO" onClick={this._sendTeamsChatMessage} />
            </div>
            { errorMessage && <div className={styles.errorMessage}>{errorMessage}</div> }
          </div>
        }
      </section>
    );
  }

  private _onPeoplePickerSelectionChanged = (e: Event): void => {
    const details: { id: string, userPrincipalName: string}[] = (e as CustomEvent).detail;
    this.setState({
      messageTo: details[0].userPrincipalName
    });
  }

  private _onMessageChanged = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
    this.setState({
      message: newValue
    });
  }

  private _getPersonalData = async (): Promise<void> => {
    const {
      middlewareUrl,
      middlewareClient,
    } = this.props;

    try {
      const getPersonalDataApiUrl = `${middlewareUrl}${middlewareUrl.charAt(middlewareUrl.length) === '/' ? '': '/'}api/GetPersonalData`;
      const personalDataResponse = await middlewareClient.get(getPersonalDataApiUrl, AadHttpClient.configurations.v1);
      const personalData = await personalDataResponse.json();
  
      this.setState({
        userPrincipalName: personalData.UserPrincipalName,
        inboxUnreadItemCount: personalData.InboxUnreadItemCount,
        inboxTotalItemCount: personalData.InboxTotalItemCount
      });
    } catch (ex) {
      this.setState({
        errorMessage: ex
      });
    }
  }

  private _sendTeamsChatMessage = async (): Promise<void> => {
    const {
      middlewareUrl,
      middlewareClient,
    } = this.props;

    const requestHeaders: Headers = new Headers();
    requestHeaders.append('Content-type', 'application/json');

    const teamsChatMessageRequest: IHttpClientOptions = {
      body: JSON.stringify({
        messageTo: this.state.messageTo,
        message: this.state.message
      }),
      headers: requestHeaders
    }

    try {
      const sendTeamsChatMessageApiUrl = `${middlewareUrl}${middlewareUrl.charAt(middlewareUrl.length) === '/' ? '': '/'}api/SendTeamsChatMessage`;
      await middlewareClient.post(
        sendTeamsChatMessageApiUrl, 
        AadHttpClient.configurations.v1, 
        teamsChatMessageRequest);  
    } catch (ex) {
      this.setState({
        errorMessage: ex
      });
    }
  }
}
