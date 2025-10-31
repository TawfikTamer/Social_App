import { Socket } from "socket.io";
import {
  conversionsRepository,
  messagesRepository,
} from "../../../DB/Repositories";
import { conversionTypeEnum } from "../../../Common";
import { Types } from "mongoose";
import { getIo } from "../../../Gatewayes/socketIo.gatewaye";

export class chatService {
  messagesReop: messagesRepository = new messagesRepository();
  conversionsRepo: conversionsRepository = new conversionsRepository();

  async joinPrivateChat(socket: Socket, targetUserId: string) {
    let conversion = await this.conversionsRepo.findOneDocument({
      type: conversionTypeEnum.DIRECT,
      members: { $all: [socket.data.userID, targetUserId] },
    });
    if (!conversion) {
      conversion = await this.conversionsRepo.createNewDocument({
        type: conversionTypeEnum.DIRECT,
        members: [socket.data.userID, targetUserId],
      });
    }
    socket.join(conversion._id.toString());
    return conversion;
  }

  async userTyping(socket: Socket, targetUserId: string) {
    const conversion = await this.joinPrivateChat(socket, targetUserId);

    socket.to(conversion._id.toString()).emit("isTyping", `ytm ketaba`);
  }

  async sendMessage(socket: Socket, data: unknown) {
    const { text, targetUserId } = data as {
      text: string;
      targetUserId: string;
    };

    const conversion = await this.joinPrivateChat(socket, targetUserId);

    const newMessage = await this.messagesReop.createNewDocument({
      text,
      senderId: socket.data.userID,
      ConversionId: conversion._id as unknown as Types.ObjectId,
    });

    getIo()?.to(conversion._id.toString()).emit("message-sent", newMessage);
  }

  async getChatHistory(socket: Socket, targetUserId: string) {
    const conversion = await this.joinPrivateChat(socket, targetUserId);

    const chat = await this.messagesReop.findDocuments({
      ConversionId: conversion._id,
    });

    socket.emit("chat-history", chat);
  }

  async joinGroupChat(socket: Socket, targerGroupId: string) {
    // console.log(typeof socket.data.userID, targerMembersId);

    let conversion = await this.conversionsRepo.findOneDocument({
      _id: targerGroupId,
      type: conversionTypeEnum.GROUP,
    });

    if (conversion) socket.join(conversion._id.toString());
    return conversion;
  }

  async sendGroupMessage(socket: Socket, data: unknown) {
    const { text, targetGroupId } = data as {
      text: string;
      targetGroupId: string;
    };

    const conversion = await this.joinGroupChat(socket, targetGroupId);

    if (conversion) {
      const newMessage = await this.messagesReop.createNewDocument({
        text,
        senderId: socket.data.userID,
        ConversionId: conversion._id as unknown as Types.ObjectId,
      });

      getIo()?.to(conversion._id.toString()).emit("message-sent", newMessage);
    }
  }

  async getGroupChatHistory(socket: Socket, targerGroupId: string) {
    const conversion = await this.joinGroupChat(socket, targerGroupId);

    if (conversion) {
      const chat = await this.messagesReop.findDocuments({
        ConversionId: conversion._id,
      });
      socket.emit("group-chat-history", chat);
    }
  }
}
