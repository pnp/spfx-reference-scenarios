import { ChatMessage } from '@microsoft/microsoft-graph-types';

export type PickedChatMessage = Pick<ChatMessage, "body" | "from" | "id" | "subject" | "replies">;

export type GetMessagesResponse = {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#Collection(chatMessage)";
    "@odata.nextLink"?: string;
    "@odata.deltaLink"?: string;
    value: (PickedChatMessage & { summary: string })[];
};
