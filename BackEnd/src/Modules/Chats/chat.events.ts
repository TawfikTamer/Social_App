import { Socket } from "socket.io";
import { chatService } from "./Services/chat.service";

export class ChatEvents {
  constructor(private socket: Socket) {}
  chatService = new chatService();
  sendPrivateMessage() {
    this.socket.on("send-private-message", (data) => {
      this.chatService.sendMessage(this.socket, data);
    });
  }
  getChatHistory() {
    this.socket.on("get-chat-history", (data) => {
      this.chatService.getChatHistory(this.socket, data);
    });
  }

  sendGroupMessage() {
    this.socket.on("send-group-message", (data) => {
      this.chatService.sendGroupMessage(this.socket, data);
    });
  }
  getGroupChatHistory() {
    this.socket.on("get-group-chat", (data) => {
      this.chatService.getGroupChatHistory(this.socket, data);
    });
  }
  userIsTyping() {
    this.socket.on("typing", (data) => {
      this.chatService.userTyping(this.socket, data);
    });
  }
}
