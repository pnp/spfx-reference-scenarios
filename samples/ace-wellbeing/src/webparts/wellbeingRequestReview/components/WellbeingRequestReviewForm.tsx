import { CloseIcon, WordColorIcon, PowerPointColorIcon } from '@fluentui/react-icons-northstar';
import { Accordion, Attachment, Button, Divider, Flex, Form, FormField, FormLabel, FormTextArea, Loader, Text } from '@fluentui/react-northstar';
import { FileList, ViewType } from '@microsoft/mgt-react';
import { SPHttpClient } from '@microsoft/sp-http';
import * as React from 'react';

export interface WellbeingRequestReviewFormProps {
  requestId: string;
  spHttpClient: SPHttpClient;
  webUrl: string;
  wellbeingRequestsListName: string;
  fileListQuery: string;
}

interface WellbeingRequestReviewFormState {
  processingRequest: boolean;
  requestReviewed: boolean;
  comment: string;
  attachment: string;
  attachmentWebUrl: string;
}

export default class WellbeingRequestReviewForm extends React.Component<WellbeingRequestReviewFormProps, WellbeingRequestReviewFormState> {
  constructor(props: WellbeingRequestReviewFormProps) {
    super(props);

    this.state = {
      processingRequest: false,
      requestReviewed: false,
      comment: null,
      attachment: null,
      attachmentWebUrl: null
    };
  }

  private approveRequest = () => this.reviewRequest('approve');
  private rejectRequest = () => this.reviewRequest('reject');

  private reviewRequest = (status: 'approve' | 'reject') => {
    this.setState({ processingRequest: true });
    this.props.spHttpClient
      .post(`${this.props.webUrl}/_api/web/lists/getByTitle('${this.props.wellbeingRequestsListName}')/items/getById(${this.props.requestId})`, SPHttpClient.configurations.v1, {
        headers: {
          'if-match': '*',
          'x-http-method': 'MERGE',
          accept: 'application/json;odata.metadata=none',
          'content-type': 'application/json;odata.metadata=none'
        },
        body: JSON.stringify({
          Status: status === 'approve' ? 'Approved' : 'Rejected',
          ReviewComment: this.state.comment,
          PolicyDocument:
          {
            'Description': this.state.attachment,
            'Url': this.state.attachmentWebUrl
          }
        })
      })
      .then(_ => {
        this.setState({
          processingRequest: false,
          requestReviewed: true
        });
      });
  }

  private commentChanged = e => this.setState({ comment: e.target.value });
  private removeAttachment = _ => this.setState({ attachment: null, attachmentWebUrl: null });
  private selectAttachment = (e) => {
    this.setState({
      attachment: e.detail.name,
      attachmentWebUrl: e.detail.webUrl.replace("action=default", "action=view")
    });
  }

  public render(): React.ReactElement<WellbeingRequestReviewFormProps> {
    const {
      processingRequest,
      requestReviewed,
      attachment
    } = this.state;
    return <Flex column gap="gap.large">
      <Divider />
      <Text size="large" content="Review" />
      {processingRequest &&
        <Loader label="Saving..." />
      }
      {!processingRequest &&
        !requestReviewed &&
        <Form>
          <FormTextArea label="Your comments" onChange={this.commentChanged} fluid />
          <Accordion panels={[{
            title: 'Select file to attach (optional)',
            content: (
              <Flex gap="gap.small" column>
                <FileList itemClick={this.selectAttachment} enableFileUpload itemView={ViewType.oneline} fileListQuery={this.props.fileListQuery} />
                {attachment &&
                  <Attachment
                    header={attachment}
                    actionable
                    icon={attachment.indexOf('.docx') > -1 ? <WordColorIcon /> : <PowerPointColorIcon />}
                    action={{
                      icon: <CloseIcon />,
                      onClick: this.removeAttachment,
                      title: 'Close',
                    }}
                  />
                }
              </Flex>
            )
          }]} />
          <FormField>
            <Flex gap="gap.small">
              <Button primary onClick={this.approveRequest}>Approve</Button>
              <Button onClick={this.rejectRequest}>Reject</Button>
            </Flex>
          </FormField>
        </Form>
      }
      {requestReviewed &&
        <Text align="center" content="Review successfully saved" />
      }
    </Flex>;
  }
}