import { stringIsNullOrEmpty, combine, isArray } from "@pnp/common";
import { GetMessagesResponse, PickedChatMessage } from "./types";
import { MSGraphClient } from "@microsoft/sp-http";
import { ChatMessage } from "@microsoft/microsoft-graph-types";

const LOCALSTORAGE_NEXTLINK_KEY = "ab51eb5c-5a82-48de-a20c-f225f0f6cc1e";

interface MessageReaderResponse {
    timeout: number;
    messages: PickedChatMessage[];
}

let _client: MSGraphClient;
let _channelBaseUrl: string;
const DoneSymbol = Symbol.for("done");
let readerCancel: number = undefined;

export function initMessages(client: MSGraphClient, channelBaseUrl: string): void {
    cancelReader();
    _client = client;
    _channelBaseUrl = channelBaseUrl;
}

export function cancelReader(): void {

    if (readerCancel) {
        clearTimeout(readerCancel);
        readerCancel = undefined;
    }
}

export function getMessageReader(batchSize = 5, pollingInterval = 10000): (onMessages: (messages: PickedChatMessage[]) => void) => void {

    // either start from the beginning
    let nextUrl = combine(_channelBaseUrl, "messages/delta");

    // const storedNextUrl = localStorage.getItem(LOCALSTORAGE_NEXTLINK_KEY);

    // if (storedNextUrl !== null) {
    //     nextUrl = storedNextUrl;
    // }

    let timeout = 100;
    let messages = [];

    // cancel any existing message reader - if this is called we have potentially a new channel to read
    cancelReader();

    async function* reader(): AsyncIterableIterator<MessageReaderResponse> {

        if (!stringIsNullOrEmpty(nextUrl)) {

            messages = await new Promise((resolve, reject) => {

                _client
                    .api(nextUrl)
                    .top(batchSize)
                    .get((error, response: any) => {

                        if (error) {
                            return reject(error);
                        }

                        if (response["@odata.nextLink"]) {

                            nextUrl = response["@odata.nextLink"];
                            timeout = 100;

                        } else if (response["@odata.deltaLink"]) {

                            nextUrl = response["@odata.deltaLink"];
                            // we don't have any more messages immediately, so we wait longer to see if there are new ones
                            timeout = pollingInterval;

                        } else {

                            // done, we use -1 to signal being done
                            resolve(<any>DoneSymbol);
                        }

                        localStorage.setItem(LOCALSTORAGE_NEXTLINK_KEY, nextUrl);

                        resolve(responseToPickedChatMessages(response));
                    });
            });
        }

        if ((<any>messages) === DoneSymbol) {
            // done
            return;
        }

        yield { messages, timeout };
    }

    return (onMessages: (messages: PickedChatMessage[]) => void) => {

        const read = async () => {

            const next = await reader().next();

            if (!next?.done) {

                const value: MessageReaderResponse = next.value;

                if (value.messages.length > 0) {

                    onMessages(value.messages);
                }

                readerCancel = setTimeout(read, value.timeout);
            }
        };

        read();
    };
}

export function getMessageDetails(id: string): Promise<ChatMessage> {

    return new Promise((resolve, reject) => {

        _client
            .api(combine(_channelBaseUrl, `/messages/${id}`))
            .get((error, response: ChatMessage) => {

                if (error) {
                    return reject(error);
                }

                resolve(response);
            });
    });
}

export function getMessageReplies(id: string, callback: (replies: PickedChatMessage[]) => void, pollingInterval = 10000): () => void {

    let timeout;

    const reader = () => {

        return new Promise<PickedChatMessage[]>((resolve, reject) => {

            // replies doesn't have a delta api so we just have to get them all I guess
            // unsure what to do if there are more than 50?
            _client
                .api(combine(_channelBaseUrl, `/messages/${id}/replies`))
                .top(5)
                .get((error, response: any) => {

                    if (error) {
                        return reject(error);
                    }

                    const replies = responseToPickedChatMessages(response);

                    // due to limitations in the graph api we can't order the replies on the server, so we flip them here.
                    resolve(replies.reverse());
                });
        });
    };

    const read = async () => {

        const replies = await reader();

        callback(replies);

        timeout = setTimeout(read, pollingInterval);
    };

    read();

    return () => clearTimeout(timeout);
}

export function addMessageReply(id: string, replyText: string): Promise<PickedChatMessage> {

    if (stringIsNullOrEmpty(replyText)) {
        return null;
    }

    return new Promise((resolve, reject) => {

        const body = {
            body: {
                content: replyText,
            }
        };

        _client
            .api(combine(_channelBaseUrl, `/messages/${id}/replies`))
            .post(body, (error, response: ChatMessage) => {

                if (error) {
                    reject(error);
                }

                resolve(CMtoPCM(response));
            });
    });
}

function responseToPickedChatMessages(response: any): PickedChatMessage[] {

    return isArray(response.value) ? response.value.map(CMtoPCM) : [];
}

function CMtoPCM(m: ChatMessage): PickedChatMessage {
    return ({
        body: m.body,
        from: m.from,
        id: m.id,
        subject: m.subject || m.summary || `${m.body.content.substr(0, 15)}${m.body.content.length > 16 ? "..." : ""}`,
    });
}
