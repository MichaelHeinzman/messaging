import { DocumentData } from "firebase/firestore";
import { Conversation } from "../../typings";
import { atom } from "recoil";

export const currentConversationState = atom<
  Conversation | DocumentData | null
>({
  key: "currentConversationState",
  default: null,
});
