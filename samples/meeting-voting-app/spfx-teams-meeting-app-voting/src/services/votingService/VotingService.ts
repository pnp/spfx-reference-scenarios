import { AadHttpClient, HttpClientResponse, IHttpClientOptions } from "@microsoft/sp-http";

export interface VotingTopic {
    id: string;
    meetingId: string;
    topic: string;
    authorUpn?: string;
    openForVoting?: boolean;
    replyId?: string;
    votingResults: VotingResults;
}

export interface VotingResults {
    yes: number;
    no: number;
    pass: number;
}

export class VotingService {

    public async AddVotingTopic(aadHttpClient: AadHttpClient, apiBaseUrl: string, meetingId: string, topic: string): Promise<void> {

        const requestHeaders: Headers = new Headers();
        requestHeaders.append('Content-type', 'application/json');
        requestHeaders.append('Accept', 'application/json');

        const requestOptions: IHttpClientOptions = {
            headers: requestHeaders,
            body: JSON.stringify(topic)
        };
  
        const httpResponse: HttpClientResponse = await aadHttpClient
            .post(
                `${apiBaseUrl}api/voting/${meetingId}/topics`,
                AadHttpClient.configurations.v1,
                requestOptions
            );

        if (!httpResponse.ok) {
            throw new Error("Failed to add the new voting topic!");
        }
    }

    public async GetVotingTopic(aadHttpClient: AadHttpClient, apiBaseUrl: string, meetingId: string, topicId: string): Promise<VotingTopic | undefined> {

        const requestHeaders: Headers = new Headers();
        requestHeaders.append('Accept', 'application/json');

        const requestOptions: IHttpClientOptions = {
            headers: requestHeaders
        };
  
        const httpResponse: HttpClientResponse = await aadHttpClient
            .get(
                `${apiBaseUrl}api/voting/${meetingId}/topics/${topicId}`,
                AadHttpClient.configurations.v1,
                requestOptions
            );

        if (httpResponse.ok) {
            const result: VotingTopic = await httpResponse.json();
            return result;
        } else {
            throw new Error("Failed to retrieve the requested voting topic!");
        }
    }

    public async GetVotingTopics(aadHttpClient: AadHttpClient, apiBaseUrl: string, meetingId: string): Promise<VotingTopic[] | undefined> {

        const requestHeaders: Headers = new Headers();
        requestHeaders.append('Accept', 'application/json');

        const requestOptions: IHttpClientOptions = {
            headers: requestHeaders
        };
  
        const httpResponse: HttpClientResponse = await aadHttpClient
            .get(
                `${apiBaseUrl}api/voting/${meetingId}/topics`,
                AadHttpClient.configurations.v1,
                requestOptions
            );

        if (httpResponse.ok) {
            const result: VotingTopic[] = await httpResponse.json();
            return result;
        } else {
            throw new Error("Failed to retrieve the voting topics for the requested meeting!");
        }
    }

    public async UpdateVotingTopic(aadHttpClient: AadHttpClient, apiBaseUrl: string, meetingId: string, topicId: string, topic: string): Promise<VotingTopic> {

        const requestHeaders: Headers = new Headers();
        requestHeaders.append('Content-type', 'application/json');
        requestHeaders.append('Accept', 'application/json');

        const requestOptions: IHttpClientOptions = {
            headers: requestHeaders,
            method: "PUT",
            body: JSON.stringify(topic)
        };
  
        const httpResponse: HttpClientResponse = await aadHttpClient
            .fetch(
                `${apiBaseUrl}api/voting/${meetingId}/topics/${topicId}`,
                AadHttpClient.configurations.v1,
                requestOptions
            );

            if (httpResponse.ok) {
                const result: VotingTopic = await httpResponse.json();
                return result;
            } else {
                throw new Error("Failed to updated the target voting topic!");
            }
        }

    public async DeleteVotingTopic(aadHttpClient: AadHttpClient, apiBaseUrl: string, meetingId: string, topicId: string): Promise<void> {

        const requestHeaders: Headers = new Headers();
        requestHeaders.append('Content-type', 'application/json');

        const requestOptions: IHttpClientOptions = {
            headers: requestHeaders,
            method: "DELETE",
        };
  
        const httpResponse: HttpClientResponse = await aadHttpClient
            .fetch(
                `${apiBaseUrl}api/voting/${meetingId}/topics/${topicId}`,
                AadHttpClient.configurations.v1,
                requestOptions
            );

        if (!httpResponse.ok) {
            throw new Error("Failed to delete the target voting topic!");
        }
    }

    public async LaunchTopic(aadHttpClient: AadHttpClient, apiBaseUrl: string, meetingId: string, topicId: string): Promise<void> {

        const requestHeaders: Headers = new Headers();
        requestHeaders.append('Content-type', 'application/json');

        const requestOptions: IHttpClientOptions = {
            headers: requestHeaders,
        };
  
        const httpResponse: HttpClientResponse = await aadHttpClient
            .post(
                `${apiBaseUrl}api/voting/${meetingId}/topics/${topicId}/launch`,
                AadHttpClient.configurations.v1,
                requestOptions
            );

        if (!httpResponse.ok) {
            throw new Error("Failed to launch the voting topic!");
        }
    }

    public async CloseTopic(aadHttpClient: AadHttpClient, apiBaseUrl: string, meetingId: string, topicId: string): Promise<void> {

        const requestHeaders: Headers = new Headers();
        requestHeaders.append('Content-type', 'application/json');

        const requestOptions: IHttpClientOptions = {
            headers: requestHeaders,
        };
  
        const httpResponse: HttpClientResponse = await aadHttpClient
            .post(
                `${apiBaseUrl}api/voting/${meetingId}/topics/${topicId}/close`,
                AadHttpClient.configurations.v1,
                requestOptions
            );

        if (!httpResponse.ok) {
            throw new Error("Failed to close the voting topic!");
        }
    }
}