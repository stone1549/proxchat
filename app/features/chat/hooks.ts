import { Location, Message, PendingMessage } from "../../domain";
import { delay, isEqual } from "lodash";
import { useAuth, useInterval } from "../../hooks";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { dateTimeReviver, getSenderFromToken } from "../../utils";
import Geolocation from "@react-native-community/geolocation";
import { selectRadiusInMeters } from "../menu/settingsSlice";
import {
  isChatMessageNotificationMessage,
  isErrorResponseMessage,
  sendHandshake,
  ServerMessage,
  ServerPayload,
  toClientSendChatMessage,
  toMessage,
} from "./protocol";
import { DateTime } from "luxon";
import { AppDispatch } from "../../../App";
import { logout } from "../login/loginSlice";

export const GPS_POLL_MS = 300000;

export type RemovePendingMessageFunc = (clientId: string) => void;
export type SendMessageFunc = (content: string, position: Location) => void;
export const useChat = () => {
  const [reconnect, setReconnect] = useState(false);
  const [reconnectDelay, setReconnectDelay] = useState(250);
  const radiusInMeters = useSelector(selectRadiusInMeters);
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [pendingMessages, setPendingMessages] = useState<Array<PendingMessage>>(
    []
  );
  const [error, setError] = useState("");
  const { position } = usePosition();
  const { token } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const ws = useMemo(() => {
    return new WebSocket("ws://127.0.0.1:9006/ws");
  }, [reconnect]);

  useEffect(() => {
    return () => {
      ws.close();
    };
  }, []);

  const removePendingMessage = useMemo<RemovePendingMessageFunc>(() => {
    return (clientId: string) => {
      const index = pendingMessages.findIndex((m) => m.clientId === clientId);
      if (index !== -1) {
        const before = pendingMessages.slice(0, index);
        const after = pendingMessages.slice(index + 1);

        setPendingMessages([...before, ...after]);
      }
    };
  }, [pendingMessages, setPendingMessages]);

  ws.onopen = () => {
    setError("");
    setReconnectDelay(250);
    if (position) {
      sendHandshake(ws, token, position, radiusInMeters);
    }
  };

  ws.onmessage = (event) => {
    try {
      const message: ServerMessage<ServerPayload> = JSON.parse(
        event.data,
        dateTimeReviver
      );

      switch (message.payload.type) {
        case "ChatMessageNotification":
          if (isChatMessageNotificationMessage(message)) {
            setMessages([...messages, toMessage(message, position)]);
            // delay(() => {
            removePendingMessage(message.payload.message.clientId);
            // }, 10);
          } else {
            console.error("Invalid ChatMessageNotification message", message);
          }
          break;
        case "HandshakeResponse":
          if (pendingMessages.length > 0) {
            pendingMessages.forEach((m) => {
              if (!m.failed && !m.succeeded) {
                ws.send(JSON.stringify(toClientSendChatMessage(m, token)));
              }
            });
          }
          break;
        case "ErrorResponse":
          if (isErrorResponseMessage(message)) {
            if (message.payload.code === 401) {
              dispatch(logout());
            } else if (message.payload.code !== 409) {
              // This error is caused when the simulator refreshes the UI to hotload changes and ends up
              // sending the handshake message more than once. We can ignore it as it should never happen
              // in production.
              setError(message.payload.error);
            }
          } else {
            console.error("Invalid ErrorResponse message", message);
          }
          break;
        default: {
          console.error("Unknown message type", message);
        }
      }
    } catch (e) {
      console.error("Failed to parse message", event.data, e);
    }
  };

  ws.onerror = (event) => {
    console.error("WebSocket error", event);
    setError("connection error");
  };

  ws.onclose = (_) => {
    delay(() => {
      setReconnect(!reconnect);
      setReconnectDelay(Math.min(reconnectDelay * 2, 60000));
    }, reconnectDelay);
    ws.close();
  };

  const sendMessage = useMemo<SendMessageFunc>(() => {
    return async (content: string, position: Location) => {
      const message: PendingMessage = {
        clientId: uuidv4(),
        content,
        sentAt: DateTime.utc(),
        sender: getSenderFromToken(token),
        location: position,
        retries: 0,
        failed: false,
        succeeded: false,
      };
      setPendingMessages([...pendingMessages, message]);
      ws.send(JSON.stringify(toClientSendChatMessage(message, token)));
    };
  }, [ws, pendingMessages, setPendingMessages, token]);

  const resendMessage = async (message: PendingMessage) => {
    for (const [index, pm] of pendingMessages.entries()) {
      if (isEqual(pm, message)) {
        setPendingMessages([
          ...pendingMessages.slice(0, index),
          {
            content: message.content,
            location: message.location,
            failed: false,
            retries: message.retries + 1,
            sentAt: DateTime.utc(),
            clientId: message.clientId,
            sender: message.sender,
            succeeded: false,
          },
          ...pendingMessages.slice(index + 1),
        ]);
        break;
      }
    }
    ws.send(JSON.stringify(toClientSendChatMessage(message, token)));
  };
  return {
    messages,
    pendingMessages,
    position,
    sendMessage,
    error,
    removePendingMessage,
    resendMessage,
    radius: radiusInMeters,
  };
};

export const usePosition = () => {
  const [position, setPosition] = useState<Location | undefined>(undefined);

  useInterval(
    () => {
      Geolocation.getCurrentPosition((response) =>
        setPosition({
          lat: response.coords.latitude,
          long: response.coords.longitude,
        })
      );
    },
    GPS_POLL_MS,
    true
  );

  return { position };
};
