import * as React from 'react';
import styles from './MeetingVoting.module.scss';
import { IMeetingVotingProps } from './IMeetingVotingProps';
import { IMeetingVotingState, VotingTopicItem, VotingTopicItemStatus } from './IMeetingVotingState';
import { escape } from '@microsoft/sp-lodash-subset';
import * as strings from 'MeetingVotingWebPartStrings';
import { ErrorMessage } from "./ErrorMessage/ErrorMessage";
import { People, Person, PersonViewType } from '@microsoft/mgt-react';
import { GridLayout } from "@pnp/spfx-controls-react/lib/GridLayout";
import { Icon, IContextualMenuProps } from 'office-ui-fabric-react/lib';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { MeetingService, Participant } from "../../../services/meetingService/MeetingService";
import { VotingService, VotingTopic } from '../../../services/votingService/VotingService';

export default class MeetingVoting extends React.Component<IMeetingVotingProps, IMeetingVotingState> {

  /**
   *
   */
  constructor(props: IMeetingVotingProps) {
    super(props);
    
    this.state = {
      error: false,
      participants: [],
      topics: []
    };
  }

  private refreshParticipants = async () => {

    // Reset the UI
    this.setState({
      error: false,
      errorMessage: null
    });

    // Double check the availability of the AadHttpClient
    if (this.props.aadHttpClient == null || this.props.graphClient == null) {
      this.setState({
        error: true,
        errorMessage: strings.MissingClientsExceptionMessage
      });
    }

    // Retrieve the list of participants
    try {
      const meetingService = new MeetingService();
      const participants: Participant[] = await meetingService.GetMeetingParticipants(
        this.props.aadHttpClient,
        this.props.apiUrl,
        this.props.teamsContext.context.meetingId); 
  
      this.setState({
        error: false,
        participants: participants
      });
    } catch (ex) {

      let errorMessage: string = "Cannot retrieve list of meeting participants.";
      if (ex instanceof Error) {
        errorMessage = ex.message;
      }

      this.setState({
        error: true,
        errorMessage: errorMessage
      });
    }
  } 

  private loadQuestions = async () => {

    // Reset the UI
    this.setState({
      error: false,
      errorMessage: null
    });

    // Double check the availability of the AadHttpClient
    if (this.props.aadHttpClient == null) {
      this.setState({
        error: true,
        errorMessage: strings.MissingClientsExceptionMessage
      });
    }

    try {
      const votingService = new VotingService();
      const topics: VotingTopic[] = await votingService.GetVotingTopics(
        this.props.aadHttpClient, 
        this.props.apiUrl, 
        this.props.teamsContext.context.meetingId);
  
      // Show result
      this.setState({
        error: false,
        errorMessage: null,
        topics: topics.map(t => ({ ...t, status: VotingTopicItemStatus.Draft }))
      });
    } catch (ex) {

      let errorMessage: string = "Cannot refresh list of topics.";
      if (ex instanceof Error) {
        errorMessage = ex.message;
      }

      this.setState({
        error: true,
        errorMessage: errorMessage
      });
    }
  } 

  private onRetryClick = () => {
    document.location.reload();
  }

  private addNewTopic = () => {

    this.props.teamsContext.teamsJs.tasks.startTask({
      title: "Add new topic",
      completionBotId: "0b906cbf-f950-443a-8b73-e0ca2bfc23fa",
      height: 300,
      width: 400,
      url: `https://${this.props.spoTenantName}/_layouts/15/TeamsLogon.aspx?SPFX=true&dest=/_layouts/15/teamstaskhostedapp.aspx%3Fteams%26personal%26componentId=2a0236c3-f47f-4006-8581-27c03a4652a5%26forceLocale={locale}`
    }, async (err: string, result: string) => {

      // Cancel in case of error
      if (err != null && err.length > 0) {
        console.log(err);
        return;
      }

      // Double check the availability of the AadHttpClient
      if (this.props.aadHttpClient != null) {

        try {

          // Add the new topic
          const votingService = new VotingService();

          await votingService.AddVotingTopic(
            this.props.aadHttpClient, 
            this.props.apiUrl,
            this.props.teamsContext.context.meetingId,
            result);
  
          this.loadQuestions();

        } catch (ex) {

          let errorMessage: string = "Cannot add the topic.";
          if (ex instanceof Error) {
            errorMessage = ex.message;
          }

          this.setState({
            error: true,
            errorMessage: errorMessage
          });
        }
      }
    });
  }

  private editTopic = (itemId: string, question: string) => {

    this.props.teamsContext.teamsJs.tasks.startTask({
      title: "Edit topic",
      completionBotId: "0b906cbf-f950-443a-8b73-e0ca2bfc23fa",
      height: 300,
      width: 400,
      url: `https://${this.props.spoTenantName}/_layouts/15/TeamsLogon.aspx?SPFX=true&dest=/_layouts/15/teamstaskhostedapp.aspx%3Fteams%26personal%26componentId=2a0236c3-f47f-4006-8581-27c03a4652a5%26forceLocale={locale}%26initialValue=${question}`
    }, async (err: string, result: string) => {

      // Cancel in case of error
      if (err != null && err.length > 0) {
        console.log(err);
        return;
      }

      // Double check the availability of the AadHttpClient
      if (this.props.aadHttpClient != null) {

        try {

          // Add the new topic
          const votingService = new VotingService();

          await votingService.UpdateVotingTopic(
            this.props.aadHttpClient, 
            this.props.apiUrl,
            this.props.teamsContext.context.meetingId,
            itemId,
            result);

          this.loadQuestions();

        } catch (ex) {

          let errorMessage: string = "Cannot update the topic.";
          if (ex instanceof Error) {
            errorMessage = ex.message;
          }

          this.setState({
            error: true,
            errorMessage: errorMessage
          });
        }
      }

    });
  }

  private deleteTopic = async (itemId: string) => {

    // Double check the availability of the AadHttpClient
    if (this.props.aadHttpClient != null) {

      try {

        // Add the new topic
        const votingService = new VotingService();

        await votingService.DeleteVotingTopic(
          this.props.aadHttpClient, 
          this.props.apiUrl,
          this.props.teamsContext.context.meetingId,
          itemId);

        this.loadQuestions();

      } catch (ex) {

        let errorMessage: string = "Cannot delete the topic.";
        if (ex instanceof Error) {
          errorMessage = ex.message;
        }

        this.setState({
          error: true,
          errorMessage: errorMessage
        });
      }
    }
  }

  private launchTopic = async (itemId: string) => {

    // Double check the availability of the AadHttpClient
    if (this.props.aadHttpClient != null) {

      try {

        // Add the new topic
        const votingService = new VotingService();

        await votingService.LaunchTopic(
          this.props.aadHttpClient, 
          this.props.apiUrl,
          this.props.teamsContext.context.meetingId,
          itemId);

        this.loadQuestions();

      } catch (ex) {

        let errorMessage: string = "Cannot launch topic.";
        if (ex instanceof Error) {
          errorMessage = ex.message;
        }

        this.setState({
          error: true,
          errorMessage: errorMessage
        });
      }
    }
  }

  private closeTopic = async (itemId: string) => {

    // Double check the availability of the AadHttpClient
    if (this.props.aadHttpClient != null) {

      try {

        // Add the new topic
        const votingService = new VotingService();

        await votingService.CloseTopic(
          this.props.aadHttpClient, 
          this.props.apiUrl,
          this.props.teamsContext.context.meetingId,
          itemId);

        this.loadQuestions();

      } catch (ex) {

        let errorMessage: string = "Cannot close topic.";
        if (ex instanceof Error) {
          errorMessage = ex.message;
        }

        this.setState({
          error: true,
          errorMessage: errorMessage
        });
      }
    }
  }

  public componentDidMount(): void {
    // load data initially after the component has been instantiated
    this.refreshParticipants();
    this.loadQuestions();
  }

  public render(): React.ReactElement<IMeetingVotingProps> {

    const userIds: string[] = this.state.participants.map(p => p.objectId);

    return (
      <div className={ styles.meetingVoting }>
        <div className={ styles.container }>
          <div className={styles.row}>
            <div className={styles.column}>
              <div className={ styles.title }>Meeting Voting System</div>
            </div>
          </div>
          { this.state.error && 
            <ErrorMessage 
            theme={this.props.theme} 
            title={strings.ExceptionTitle} 
            error={this.state.errorMessage} 
            onClick={this.onRetryClick}
          />
          }
          { !this.state.error &&
            <div className={styles.row}>
              <div className={styles.column}>
                <div className={ styles.subTitle }>Meeting Participants</div>
                <People userIds={userIds} />
              </div>
              <div className={styles.column}>
                <div className={ styles.subTitle }>Topics to Vote</div>
                <div>
                  <GridLayout
                    ariaLabel="List of topics to vote for."
                    items={this.state.topics}
                    onRenderGridItem={(item: any) => this._onRenderQuestion(item)}
                  />
                  <DefaultButton 
                    iconProps={ {iconName: 'Add'} }
                    text={strings.CommandNewLabel}
                    className={styles.questionButton}
                    onClick={this.addNewTopic}
                  />
                </div>
              </div>
            </div>
          }
          <div className={styles.row}>
            <div className={styles.column}>
              <div className={ styles.footer }>[Build v. {this.props.buildVersion}]</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  private _onRenderQuestion = (topic: VotingTopicItem): JSX.Element => {

    const menuProps: IContextualMenuProps = {
      items: [
        {
          key: 'edit',
          text: strings.CommandEditLabel,
          iconProps: { iconName: 'Edit', className: 'iconColor' },
          className: styles.questionButton,
          onClick: () => this.editTopic(topic.id, topic.topic)
        },
        {
          key: 'delete',
          text: strings.CommandDeleteLabel,
          iconProps: { iconName: 'Delete', className: 'iconColor' },
          className: styles.questionButton,
          onClick: () => this.deleteTopic(topic.id)
        },
      ],
    };
    
    return <div key={topic.id}
        className={styles.questionCard}
        data-is-focusable={true}
        role="listitem"
        aria-label={topic.topic}
      >
        <Label className={styles.questionText}>{topic.topic}</Label>
        <div>
          <Person userId={topic.authorUpn} view={PersonViewType.oneline} />
        </div>
        { topic.authorUpn === this.props.currentUser ?
          <div className={styles.questionButtonContainer}>
            <DefaultButton 
              split 
              menuProps={ topic.openForVoting ? null : menuProps}
              text={ topic.openForVoting ? strings.CommandCloseLabel : strings.CommandLaunchLabel } 
              onClick={() => { if (topic.openForVoting) { this.closeTopic(topic.id); } else { this.launchTopic(topic.id); } } }
              />
          </div> : null
        }
      </div>;
  }
}
