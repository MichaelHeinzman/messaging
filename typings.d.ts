import { type } from "os";

export interface User {
  id: string;
  name: string;
  displayName: string;
  email: string;
  friends: User.id[];
  photoURL: string;
}

export interface Conversation {
  id: string;
  creator: string;
  name: string;
  members: string[];
  typing: [];
  recentMessage: RecentMessage | null;
}

export interface RecentMessage {
  id: string;
  messageText: string;
  readBy: ReadyBy;
}

export interface ReadBy {
  sentAt: string;
  sentBy: string;
  read: string[];
}
export interface Message {
  id: string;
  sender: User.id;
  timestamp: string;
  read: string[];
  type: "image" | "text";
  text?: string;
  image?: string;
  groupId: string;
}
