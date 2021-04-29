import { AadHttpClient, HttpClientResponse, IHttpClientOptions } from "@microsoft/sp-http";

export interface Participant {
    inMeeting: boolean;
    objectId: string;
    role: ParticipantRole;
    userPrincipalName: string;
}

enum ParticipantRole {
    Attendee = 1,
    Organizer = 2,
}

export interface Message {
    text: string;
    summary: string;
}

export interface CardMessage extends Message {
    card: string;
}

export interface NotificationMessage extends Message {
    notificationUrl: string;
    title: string;
    height: number;
    widht: number;
}

export class MeetingService {

    public async GetMeetingParticipant(aadHttpClient: AadHttpClient, apiBaseUrl: string, meetingId: string, participantUpn: string): Promise<Participant | undefined> {

        const requestHeaders: Headers = new Headers();
        requestHeaders.append('Accept', 'application/json');

        const requestOptions: IHttpClientOptions = {
            headers: requestHeaders
        };
  
        const httpResponse: HttpClientResponse = await aadHttpClient
            .get(
                `${apiBaseUrl}api/meetings/${meetingId}/participants/${participantUpn}`,
                AadHttpClient.configurations.v1,
                requestOptions
            );

        if (httpResponse.ok) {
            const result: Participant = await httpResponse.json();
            return result;
        } else {
            throw new Error("Failed to retrieve the requested meeting participant!");
        }
    }

    public async GetMeetingParticipants(aadHttpClient: AadHttpClient, apiBaseUrl: string, meetingId: string): Promise<Participant[] | undefined> {

        const requestHeaders: Headers = new Headers();
        requestHeaders.append('Accept', 'application/json');

        const requestOptions: IHttpClientOptions = {
            headers: requestHeaders
        };
  
        const httpResponse: HttpClientResponse = await aadHttpClient
            .get(
                `${apiBaseUrl}api/meetings/${meetingId}/participants`,
                AadHttpClient.configurations.v1,
                requestOptions
            );

        if (httpResponse.ok) {
            const result: Participant[] = await httpResponse.json();
            return result;
        } else {
            throw new Error("Failed to retrieve the meeting participants!");
        }
    }

    public async SendText(aadHttpClient: AadHttpClient, apiBaseUrl: string, meetingId: string, message: Message): Promise<void> {

        const requestHeaders: Headers = new Headers();
        requestHeaders.append('Content-type', 'application/json');

        const requestOptions: IHttpClientOptions = {
            headers: requestHeaders,
            body: JSON.stringify(message)
        };
  
        const httpResponse: HttpClientResponse = await aadHttpClient
            .post(
                `${apiBaseUrl}api/meetings/${meetingId}/sendText`,
                AadHttpClient.configurations.v1,
                requestOptions
            );

        if (!httpResponse.ok) {
            throw new Error("Failed to send text message to the meeting conversation!");
        }
    }

    public async SendCard(aadHttpClient: AadHttpClient, apiBaseUrl: string, meetingId: string, message: CardMessage): Promise<void> {

        const requestHeaders: Headers = new Headers();
        requestHeaders.append('Content-type', 'application/json');

        const requestOptions: IHttpClientOptions = {
            headers: requestHeaders,
            body: JSON.stringify(message)
        };
  
        const httpResponse: HttpClientResponse = await aadHttpClient
            .post(
                `${apiBaseUrl}api/meetings/${meetingId}/sendCard`,
                AadHttpClient.configurations.v1,
                requestOptions
            );

        if (!httpResponse.ok) {
            throw new Error("Failed to send card message to the meeting conversation!");
        }
    }

    public async SendNotification(aadHttpClient: AadHttpClient, apiBaseUrl: string, meetingId: string, message: NotificationMessage): Promise<void> {

        const requestHeaders: Headers = new Headers();
        requestHeaders.append('Content-type', 'application/json');

        const requestOptions: IHttpClientOptions = {
            headers: requestHeaders,
            body: JSON.stringify(message)
        };
  
        const httpResponse: HttpClientResponse = await aadHttpClient
            .post(
                `${apiBaseUrl}api/meetings/${meetingId}/sendNotification`,
                AadHttpClient.configurations.v1,
                requestOptions
            );

        if (!httpResponse.ok) {
            throw new Error("Failed to send notification message to the meeting conversation!");
        }
    }
}