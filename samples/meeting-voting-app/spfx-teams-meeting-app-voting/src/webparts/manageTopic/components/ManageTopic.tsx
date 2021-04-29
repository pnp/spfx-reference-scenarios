import * as React from 'react';
import styles from './ManageTopic.module.scss';
import { IManageTopicProps } from './IManageTopicProps';
import { IManageTopicState } from './IManageTopicState';
import { escape } from '@microsoft/sp-lodash-subset';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import * as strings from 'ManageTopicWebPartStrings';

export default class ManageTopic extends React.Component<IManageTopicProps, IManageTopicState> {

  constructor(props: IManageTopicProps) {
    super(props);

    this.state = {
      question: this.props.initialValue
    };
  }

  private submitTask = () => {
    this.props.teamsContext.teamsJs.tasks.submitTask(this.state.question);
  }

  private cancelTask = () => {
    this.props.teamsContext.teamsJs.tasks.submitTask(null);
  }
  
  private onTopicChange = (event, newValue: string) => {
    this.setState({
      question: newValue
    });
  }

  public render(): React.ReactElement<IManageTopicProps> {

    return (
      <div className={ styles.manageTopic }>
        <div className={ styles.container }>
          <div className={ styles.row }>
            <div className={ styles.column }>
              <Label>Quesiton topic:</Label>
              <TextField onChange={this.onTopicChange} value={this.state.question} cols={100} multiline={true} rows={3} />
            </div>
          </div>
          <div className={ styles.row }>
            <div className={ styles.column }>
              <div className={styles.topicButtonContainer}>
                <DefaultButton onClick={this.cancelTask} text={strings.ButtonCancelLabel} />
                <PrimaryButton className={styles.topicButton} onClick={this.submitTask} text={strings.ButtonSaveLabel} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
