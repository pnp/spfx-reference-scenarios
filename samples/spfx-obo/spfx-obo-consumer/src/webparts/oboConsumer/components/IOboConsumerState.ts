export interface IOboConsumerState {
  userPrincipalName?: string;
  inboxUnreadItemCount?: number;
  inboxTotalItemCount?: number;
  messageTo?: string;
  message?: string;
  errorMessage: string;
}
