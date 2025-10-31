import { Socket } from "socket.io";
import { ChatEvents } from "./chat.events";

export const ChatInit = (socket: Socket) => {
  const chatEvents = new ChatEvents(socket);
  chatEvents.sendPrivateMessage();
  chatEvents.getChatHistory();

  chatEvents.sendGroupMessage();
  chatEvents.getGroupChatHistory();

  chatEvents.userIsTyping();
};
