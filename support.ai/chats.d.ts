export type Chat = {
  time: string;
  message: string;
};

export function log(chats: Chat[]): void;

export const chats: Chat[];