import { Sender, Location, PendingMessage, Message } from "../../domain";
import { DateTime } from "luxon";
import haversineDistance from "haversine-distance";
import { v4 as uuidv4 } from "uuid";

export enum ClientMessageType {
  Handshake = "Handshake",
  SendChatMessage = "SendChatMessage",
  UpdateLocation = "UpdateLocation",
}

export enum ServerMessageType {
  HandshakeResponse = "HandshakeResponse",
  ChatMessageNotification = "ChatMessageNotification",
  ErrorResponse = "ErrorResponse",
}

export interface ClientPayload {
  type: keyof typeof ClientMessageType;
}

export interface ServerPayload {
  type: keyof typeof ServerMessageType;
}

export interface ClientMessage<PAYLOAD extends ClientPayload> {
  id: string;
  token: string;
  payload: PAYLOAD;
}

export interface ServerMessage<PAYLOAD extends ServerPayload> {
  id: string;
  payload: PAYLOAD;
}

export interface ClientHandshakeMessage
  extends ClientMessage<{
    type: ClientMessageType.Handshake;
    position: Location;
    radius: number;
  }> {}

export const sendHandshake = (
  ws: WebSocket,
  token: string,
  position: Location,
  radiusInMeters: number
) => {
  const handshake: ClientHandshakeMessage = {
    id: uuidv4(),
    token,
    payload: {
      type: ClientMessageType.Handshake,
      position,
      radius: radiusInMeters,
    },
  };
  ws.send(JSON.stringify(handshake));
};

export interface HandshakeResponseMessage
  extends ServerMessage<{
    type: ServerMessageType.HandshakeResponse;
    error?: string;
  }> {}

export interface ClientUpdateLocationMessage
  extends ClientMessage<{
    type: ClientMessageType.SendChatMessage;
    position: Location;
    radius: number;
  }> {}

export interface ClientSendChatMessage
  extends ClientMessage<{
    type: ClientMessageType.SendChatMessage;
    clientId: string;
    content: string;
    position: Location;
    sentAt: DateTime;
  }> {}

export const toClientSendChatMessage = (
  pending: PendingMessage,
  token: string
): ClientSendChatMessage => {
  return {
    id: pending.clientId,
    token,
    payload: {
      type: ClientMessageType.SendChatMessage,
      clientId: pending.clientId,
      content: pending.content,
      position: pending.location,
      sentAt: DateTime.utc(),
    },
  };
};

export interface ChatMessageNotificationMessage
  extends ServerMessage<{
    type: ServerMessageType.ChatMessageNotification;
    message: ChatMessage;
  }> {}

export const isChatMessageNotificationMessage = (
  message: ServerMessage<ServerPayload>
): message is ChatMessageNotificationMessage => {
  return message.payload.type === ServerMessageType.ChatMessageNotification;
};

export const toMessage = (
  message: ChatMessageNotificationMessage,
  position: Location | undefined
): Message => {
  const msgPosition = message.payload.message.position;
  return {
    id: message.payload.message.id,
    clientId: message.payload.message.clientId,
    sender: message.payload.message.sender,
    sentAt: message.payload.message.sentAt,
    receivedAt: message.payload.message.receivedAt,
    content: message.payload.message.content,
    location: msgPosition,
    distanceInMeters: position
      ? haversineDistance(
          {
            latitude: msgPosition.lat,
            longitude: msgPosition.long,
          },
          {
            latitude: position.lat,
            longitude: position.long,
          }
        )
      : NaN,
  };
};

export interface ChatMessage {
  id: string;
  clientId: string;
  sender: Sender;
  sentAt: DateTime;
  receivedAt: DateTime;
  content: string;
  position: Location;
}

export interface ErrorResponseMessage
  extends ServerMessage<{
    type: ServerMessageType.ErrorResponse;
    code: number;
    error: string;
  }> {}

export const isErrorResponseMessage = (
  message: ServerMessage<ServerPayload>
): message is ErrorResponseMessage => {
  return message.payload.type === ServerMessageType.ErrorResponse;
};
