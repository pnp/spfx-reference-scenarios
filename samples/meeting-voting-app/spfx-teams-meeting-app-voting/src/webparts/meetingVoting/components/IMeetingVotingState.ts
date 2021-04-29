import { Participant } from '../../../services/meetingService/MeetingService';
import { VotingTopic } from '../../../services/votingService/VotingService';

export interface VotingTopicItem extends VotingTopic {
  status: VotingTopicItemStatus;
  yes?: number;
  no?: number;
  pass?: number;
}

export enum VotingTopicItemStatus {
  Draft = 0,
  Launched = 1,
  Closed = 2
}

export interface IMeetingVotingState {
  error: boolean;
  errorMessage?: string;
  participants: Participant[];
  topics?: VotingTopicItem[];
}
