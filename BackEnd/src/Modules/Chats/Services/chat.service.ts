import { Socket } from "socket.io";
import {
  conversionsRepository,
  messagesRepository,
} from "../../../DB/Repositories";
import { conversionTypeEnum } from "../../../Common";
import { Types } from "mongoose";
import { getIo } from "../../../Gatewayes/socketIo.gatewaye";

/**
 * Service class handling real-time chat functionality using Socket.IO
 * Manages both private (direct) and group chat conversations including
 * message sending, typing indicators, and chat history retrieval.
 */

export class chatService {
  messagesReop: messagesRepository = new messagesRepository();
  conversionsRepo: conversionsRepository = new conversionsRepository();

  /**
   * Creates or joins a private chat room between two users
   * @param {Socket} socket - The socket instance of the current user
   * @param {string} targetUserId - The ID of the user to chat with
   * @returns {Promise<any>} The conversion (chat room) document
   * @socket_event join_room When user joins the chat room
   */
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

  /**
   * Emits typing indicator to chat participants
   * @param {Socket} socket - The socket instance of the typing user
   * @param {string} targetUserId - The ID of the user to notify
   * @socket_event isTyping Emitted when user starts typing
   */
  async userTyping(socket: Socket, targetUserId: string) {
    const conversion = await this.joinPrivateChat(socket, targetUserId);

    socket.to(conversion._id.toString()).emit("isTyping", `ytm ketaba`);
  }

  /**
   * Sends a private message to a specific user
   * @param {Socket} socket - The socket instance of the sender
   * @param {Object} data - Message data containing text and targetUserId
   * @socket_event message-sent Emitted when message is sent successfully
   */
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

  /**
   * Retrieves chat history between two users
   * @param {Socket} socket - The socket instance of the requesting user
   * @param {string} targetUserId - The ID of the other chat participant
   * @socket_event chat-history Emitted with array of previous messages
   */
  async getChatHistory(socket: Socket, targetUserId: string) {
    const conversion = await this.joinPrivateChat(socket, targetUserId);

    const chat = await this.messagesReop.findDocuments({
      ConversionId: conversion._id,
    });

    socket.emit("chat-history", chat);
  }

  /**
   * Joins a group chat room
   * @param {Socket} socket - The socket instance of the joining user
   * @param {string} targerGroupId - The ID of the group to join
   * @returns {Promise<any>} The group conversion document
   * @socket_event join_room When user joins the group room
   */
  async joinGroupChat(socket: Socket, targerGroupId: string) {
    // console.log(typeof socket.data.userID, targerMembersId);

    let conversion = await this.conversionsRepo.findOneDocument({
      _id: targerGroupId,
      type: conversionTypeEnum.GROUP,
    });

    if (conversion) socket.join(conversion._id.toString());
    return conversion;
  }

  /**
   * Sends a message to a group chat
   * @param {Socket} socket - The socket instance of the sender
   * @param {Object} data - Message data containing text and targetGroupId
   * @socket_event message-sent Emitted when message is sent successfully
   */
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

  /**
   * Retrieves message history for a group chat
   * @param {Socket} socket - The socket instance of the requesting user
   * @param {string} targerGroupId - The ID of the group
   * @socket_event group-chat-history Emitted with array of previous messages
   */
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
