import { Alert, ArrowLeftIcon, Button, Card, EyeFriendlierIcon, Flex, Loader, Provider, teamsTheme, Text } from '@fluentui/react-northstar';
import { Agenda, MgtTemplateProps, People, Person } from '@microsoft/mgt-react';
import { SPHttpClient } from '@microsoft/sp-http';
import * as React from 'react';
import { IWellbeingRequestReviewProps } from './IWellbeingRequestReviewProps';
import styles from './WellbeingRequestReview.module.scss';
import WellbeingRequestReviewForm from './WellbeingRequestReviewForm';
import { MSGraph } from '../services/msgraph';

interface WellbeingRequest {
  employee?: {
    name: string;
    email: string;
  };
  employeeId: number;
  id: number;
  comments: string;
  date: Date;
}

interface WellbeingRequestReviewState {
  loading: boolean;
  requestId: string;
  requests?: WellbeingRequest[];
  wellbeingGroupId?: string;
  events?: [];
  error: boolean;
  errorMessage: string;
}

// #region Mockdata

const attendees = [
  {
    "displayName": "Adele Vance",
    "userPrincipalName": "adelev@tenantname.onmicrosoft.com"
  },
  {
    "displayName": "Christie Cline",
    "userPrincipalName": "ccline@tenantname.onmicrosoft.com"
  },
  {
    "displayName": "Cathy Dew",
    "userPrincipalName": "cdew@tenantname.onmicrosoft.com"
  },
  {
    "displayName": "Debra Berger",
    "userPrincipalName": "dberger@tenantname.onmicrosoft.com"
  },
  {
    "displayName": "Diego Siciliani",
    "userPrincipalName": "diegos@tenantname.onmicrosoft.com"
  },
  {
    "displayName": "Grady Archer",
    "userPrincipalName": "gradya@tenantname.onmicrosoft.com"
  },
  {
    "displayName": "Lee Gu",
    "userPrincipalName": "leeg@tenantname.onmicrosoft.com"
  },
  {
    "displayName": "Lidia Holloway",
    "userPrincipalName": "lidiah@tenantname.onmicrosoft.com"
  },
  {
    "displayName": "Megan Bowen",
    "userPrincipalName": "mbowen@tenantname.onmicrosoft.com"
  },
  {
    "displayName": "Miriam Graham",
    "userPrincipalName": "mgraham@tenantname.onmicrosoft.com"
  },
  {
    "displayName": "Pradeep Gupta",
    "userPrincipalName": "pguptpa@tenantname.onmicrosoft.com"
  }
];

const events = [
  'New Product Regulations Touchpoint',
  'Latin American Product Manual Group',
  'Cloud and Mobile Working Group',
  'Server Upgrades',
  'Responsive Design Kick-Off Meeting',
  'Forecasting',
  'Usability Reporting Review'
];

const dayFromDateTime = dateTimeString => {
  let date = new Date(dateTimeString);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  let monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  let monthIndex = date.getMonth();
  let day = date.getDate();
  let year = date.getFullYear();

  return monthNames[monthIndex] + ' ' + day + ' ' + year;
};

const rand = (min, max) => {
  return Math.round(Math.random() * (max - min) + min);
};

const getMockEvents = (requestDate: Date, attendee) => {
  const eventsCopy = events.map((e, i) => {
    return {
      id: `a${i}`,
      subject: e
    };
  });
  eventsCopy.forEach((event, i) => {
    const attendeesCopy = [...attendees];
    const numAttendees = rand(1, attendeesCopy.length);
    const eventAttendees = [];
    for (let j = 0; j < numAttendees; j++) {
      eventAttendees.push(attendeesCopy.splice(rand(0, attendeesCopy.length - 1), 1)[0]);
    }
    (event as any).attendees = eventAttendees.map(a => {
      return {
        emailAddress: {
          name: a.displayName,
          address: a.userPrincipalName
        }
      };
    });
    const eventDate = new Date(requestDate);
    eventDate.setDate(eventDate.getDate() + (i < 3 ? i - 3 : i));
    (event as any).start = {
      dateTime: eventDate.toISOString(),
      timeZone: 'UTC'
    };
    (event as any).end = {
      dateTime: eventDate.toISOString(),
      timeZone: 'UTC'
    };
  });

  eventsCopy.splice(3, 0, {
    id: `wellbeing`,
    subject: 'Wellbeing day',
    attendees: [{
      emailAddress: {
        name: attendee.name,
        address: attendee.email
      }
    }],
    start: {
      dateTime: requestDate.toISOString(),
      timeZone: 'UTC'
    },
    end: {
      dateTime: requestDate.toISOString(),
      timeZone: 'UTC'
    }
  } as any);

  return eventsCopy;
};

//#endregion

const TimelineTemplate = (props: MgtTemplateProps) => {
  const { event } = props.dataContext;
  return <div className={styles.root}>
    <div className={styles.timeContainer}>
      <div className={styles.date}>{dayFromDateTime(event.start.dateTime)}</div>
    </div>

    <div className={styles.separator}>
      <div className={`${styles.verticalLine} ${styles.top}`}></div>
      <div className={styles.circle}>
        <div data-if="!event.bodyPreview.includes('Join Microsoft Teams Meeting')" className={styles.innerCircle}>
        </div>
      </div>
      <div className={`${styles.verticalLine} ${styles.bottom}`}></div>
    </div>

    <div className={styles.details}>
      <div>{event.subject}</div>
      <People peopleQueries={event.attendees.map(a => a.emailAddress.address)} showMax={5} />
    </div>
  </div>;
};

export default class WellbeingRequestReview extends React.Component<IWellbeingRequestReviewProps, WellbeingRequestReviewState> {
  constructor(props: IWellbeingRequestReviewProps) {
    super(props);

    this.state = {
      loading: true,
      requestId: props.requestId,
      wellbeingGroupId: null,
      events: [],
      error: props.error,
      errorMessage: props.errorMessage
    };
  }

  public async componentDidMount(): Promise<void> {
    if (!this.state.error) {
      this.loadPendingRequests();
      await this.getGroupId();
      await this.getEvents();
    } else {
      this.setState({
        loading: false
      });
    }
  }

  public async componentDidUpdate(): Promise<void> {
    if (!this.state.error &&
      this.state.wellbeingGroupId !== null &&
      this.state.events.length === 0)
      await this.getEvents();
  }

  private async getEvents(): Promise<void> {

    const {
      requests,
      requestId
    } = this.state;
    const request = requestId && requests ? requests.find(r => r.id.toString() === requestId) : undefined;

    if (request !== undefined) {

      if (this.state.wellbeingGroupId != null) {

        let previousEvents = await this.getPreviousEvents(request);

        let requestedEvent = {
          id: `wellbeing`,
          subject: 'Wellbeing day',
          attendees: [{
            emailAddress: {
              name: request.employee.name,
              address: request.employee.email
            }
          }],
          start: {
            dateTime: request.date.toISOString(),
            timeZone: 'UTC'
          },
          end: {
            dateTime: request.date.toISOString(),
            timeZone: 'UTC'
          }
        };

        let futureEvents = await this.getFutureEvents(request);

        let allEvents: any = [...previousEvents, requestedEvent, ...futureEvents];

        this.setState({
          events: allEvents
        });
      }
    }

  }

  private async getGroupId(): Promise<void> {
    try {
      let groupDetails = await MSGraph.Get(
        `/groups`,
        "v1.0",
        ["id"],
        [],
        `mail eq '${this.props.wellbeingGroupMailAddress}'`,
        1);

      this.setState({
        wellbeingGroupId: groupDetails?.value[0]?.id
      });

    } catch (err) {
      console.error(err);
      this.setState({
        error: true,
        errorMessage: "Unable to get group id"
      });
    }
  }

  private async getPreviousEvents(request: WellbeingRequest): Promise<any> {

    try {
      let previousEvents = await MSGraph.Get(
        `/groups/${this.state.wellbeingGroupId}/calendar/events`,
        "v1.0",
        ["subject,attendees,start,end"],
        [],
        `start/datetime le '${request.date.toISOString()}'`,
        2,
        "start/datetime desc");

      return previousEvents.value.reverse();

    } catch (err) {
      console.error(err);
      this.setState({
        error: true,
        errorMessage: "Unable to get events"
      });
      return null;
    }
  }

  private async getFutureEvents(request: WellbeingRequest): Promise<any> {

    try {
      let futureEvents = await MSGraph.Get(
        `/groups/${this.state.wellbeingGroupId}/calendar/events`,
        "v1.0",
        ["subject,attendees,start,end"],
        [],
        `start/datetime ge '${request.date.toISOString()}'`,
        2,
        "start/datetime");

      return futureEvents.value;

    } catch (err) {
      console.error(err);
      this.setState({
        error: true,
        errorMessage: "Unable to get events"
      });
      return null;
    }

  }

  private loadPendingRequests(): void {
    let wellbeingRequests;
    this.props.spHttpClient
      .get(`${this.props.webUrl}/_api/web/lists/getByTitle('${this.props.wellbeingRequestsListName}')/items?$select=Id,EmployeeId,Date,Comments&$filter=Status eq 'Requested'`, SPHttpClient.configurations.v1, {
        headers: {
          accept: 'application/json;odata.metadata=none'
        }
      })
      .then(res => {
        if (!res.ok) {
          return Promise.reject(res.statusText);
        }

        return res.json();
      })
      .then(requests => {
        wellbeingRequests = requests.value.map(request => {
          return {
            employeeId: request.EmployeeId,
            id: request.Id,
            comments: request.Comments,
            date: new Date(request.Date)
          };
        });

        const uniqueUserIds = Array.from(new Set(wellbeingRequests.map(r => r.employeeId)));
        return Promise.all(uniqueUserIds.map(userId => this.props.spHttpClient
          .get(`${this.props.webUrl}/_api/web/siteUsers/getById(${userId})`, SPHttpClient.configurations.v1, {
            headers: {
              accept: 'application/json;odata.metadata=none',
              'content-type': 'application/json;odata.metadata=none'
            }
          })));
      })
      .then(res => {
        return Promise.all(res.filter(r => r.ok).map(r => r.json()));
      })
      .then(users => {
        users.forEach(user => {
          wellbeingRequests
            .filter(request => request.employeeId === user.Id)
            .forEach(request => {
              request.employee = {
                name: user.Title,
                email: user.UserPrincipalName
              };
            });
        });
        this.setState({
          requests: wellbeingRequests,
          loading: false
        });
      }, err => {
        console.error(err);
        this.setState({
          loading: false,
          error: true,
          errorMessage: "Uh oh! Something went wrong."
        });
      });
  }

  private viewRequest = (requestId: number) => {
    this.setState({
      requestId: requestId.toString()
    });
  }

  private resetRequest = () => this.setState({ requestId: '', events: [] });

  public render(): React.ReactElement<IWellbeingRequestReviewProps> {
    const {
      loading,
      requests,
      requestId,
      error,
      errorMessage
    } = this.state;
    const request = requestId && requests ? requests.find(r => r.id.toString() === requestId) : undefined;
    // const teamEvents = loading || !request ? [] : getEvents(request.date, request.employee) as any;
    const teamEvents = loading || !request ? [] : this.state.events;

    return (
      <div className={styles.wellbeingRequestReview}>
        <Provider theme={teamsTheme}>
          <div className={styles.provider}>
            <Flex gap="gap.large" column>
              <Text size="larger" content={'Review wellbeing request' + (requests ? 's' : '')} />
              {
                error &&
                <Alert warning content={errorMessage} />
              }
              {loading &&
                <Loader label="Loading request information..." />
              }
              {!loading &&
                !request &&
                requests &&
                requests.length > 0 &&
                <table>
                  <tr>
                    <th colSpan={2}>Employee</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                  {requests.map(r =>
                    <tr>
                      <td style={{ width: '1px' }}><Person personQuery={r.employee.email} /></td>
                      <td>{r.employee.name}</td>
                      <td>{r.date.toLocaleDateString('en-US')}</td>
                      <td><Button icon={<EyeFriendlierIcon />} text iconOnly title="View" onClick={_ => this.viewRequest(r.id)} /></td>
                    </tr>)}
                </table>}
              {!loading &&
                request &&
                <Flex gap="gap.large" vAlign="start" column={this.props.isNarrow}>
                  <Flex.Item size="size.quarter">
                    <Flex column gap="gap.large" vAlign="start">
                      <Flex gap="gap.small">
                        <Button icon={<ArrowLeftIcon />} content="Back" onClick={this.resetRequest} />
                      </Flex>
                      <Card elevated>
                        <Card.Header>
                          <Flex gap="gap.small" vAlign="center">
                            <div className={styles.avatar}><Person personQuery={request.employee.email} avatarSize="large" /></div>
                            <Text content={request.employee.name} weight="bold" size="larger" />
                          </Flex>
                        </Card.Header>
                        <Card.Body>
                          <Flex column>
                            <Text content="Requested for" weight="semibold" />
                            <Text content={request.date.toLocaleDateString('en-US')} />
                            <br />
                            <Text content="Comments" weight="semibold" />
                            <Text content={request.comments} temporary />
                          </Flex>
                        </Card.Body>
                      </Card>

                      <WellbeingRequestReviewForm
                        fileListQuery={this.props.fileListQuery}
                        requestId={this.state.requestId}
                        spHttpClient={this.props.spHttpClient}
                        webUrl={this.props.webUrl}
                        wellbeingRequestsListName={this.props.wellbeingRequestsListName} />
                    </Flex>
                  </Flex.Item>
                  <Flex.Item size="size.half">
                    <div>
                      <Text size="large" content="Team calendar" className={styles.agendaTitle} />
                      <Agenda events={teamEvents}>
                        <TimelineTemplate template="event" />
                      </Agenda>
                    </div>
                  </Flex.Item>
                </Flex>
              }
            </Flex>
          </div>
        </Provider>
      </div>
    );
  }
}