import { Location, Message, PendingMessage } from "../../domain";
import { isEqual } from "lodash";
import { AppDispatch } from "../../../App";
import { AuthError, ChatError, pollChat, send } from "../../api";
import { reauth, useAuth, useInterval } from "../../hooks";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { getSenderFromToken } from "../../utils";
import Geolocation from "@react-native-community/geolocation";
import { selectRadiusInMeters } from "../menu/settingsSlice";

export const CHAT_POLL_MS = 5000;
export const GPS_POLL_MS = 300000;

type RemovePendingMessageFunc = (message: Message | PendingMessage) => void;
type SendMessageFunc = (content: string, position: Location) => void;

export const useChat = () => {
  const radiusInMeters = useSelector(selectRadiusInMeters);
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [pendingMessages, setPendingMessages] = useState<Array<PendingMessage>>(
    []
  );
  const [error, setError] = useState("");
  const { position } = usePosition();
  const { token } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const removePendingMessage = useMemo<RemovePendingMessageFunc>(() => {
    return (message: Message | PendingMessage) => {
      for (const [index, pending] of pendingMessages.entries()) {
        if (match(pending, message)) {
          const before = pendingMessages.slice(0, index);
          const after = pendingMessages.slice(index + 1);
          setPendingMessages([...before, ...after]);
        }
      }
    };
  }, [pendingMessages, setPendingMessages]);

  const poll = async (token: string) => {
    await sendPendingMessages(
      pendingMessages,
      setPendingMessages,
      messages,
      token,
      dispatch
    );
    let after = moment().subtract(10, "minutes");

    if (messages.length > 0) {
      after = messages[messages.length - 1].createdAt;
    }
    if (position !== undefined) {
      const newMessages = await pollChat(
        position,
        radiusInMeters,
        after,
        token
      );
      setError("");
      if (newMessages.length > 0) {
        for (const newMessage of newMessages) {
          removePendingMessage(newMessage);
        }
        setMessages([...messages, ...newMessages]);
      }
    }
  };

  useInterval(
    async () => {
      try {
        await poll(token);
      } catch (e) {
        await handleError(e, poll, setError, dispatch);
      }
    },
    CHAT_POLL_MS,
    true
  );

  const sendMessage = useMemo<SendMessageFunc>(() => {
    return async (content: string, position: Location) => {
      setPendingMessages([
        ...pendingMessages,
        {
          clientId: uuidv4(),
          content,
          sender: getSenderFromToken(token),
          location: position,
          retries: 0,
          failed: false,
          createdAt: moment(),
          succeeded: false,
        },
      ]);
    };
  }, [token, setPendingMessages, pendingMessages]);

  const resendMessage = async (message: PendingMessage) => {
    const sendFunc = async (token: string) => {
      await send(message.content, message.location, message.clientId, token);
    };
    try {
      for (const [index, pm] of pendingMessages.entries()) {
        if (isEqual(pm, message)) {
          setPendingMessages([
            ...pendingMessages.slice(0, index),
            {
              content: message.content,
              location: message.location,
              failed: false,
              retries: message.retries + 1,
              createdAt: moment(),
              clientId: message.clientId,
              sender: message.sender,
              succeeded: false,
            },
            ...pendingMessages.slice(index + 1),
          ]);
          break;
        }
      }
      await sendFunc(token);
    } catch (e) {
      await handleError(e, sendFunc, setError, dispatch);
    }
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

const match = (pending: PendingMessage, message: Message | PendingMessage) => {
  return pending.clientId === message.clientId;
};

const sendPendingMessages = async (
  pendingMessages: Array<PendingMessage>,
  setPendingMessages: (pendingMessages: Array<PendingMessage>) => void,
  messages: Array<Message>,
  token: string,
  dispatch: AppDispatch
) => {
  const stillPending: Array<PendingMessage> = [];
  for (const pendingMessage of pendingMessages) {
    const sendFunc = async (token: string) => {
      await send(
        pendingMessage.content,
        pendingMessage.location,
        pendingMessage.clientId,
        token
      );
    };

    try {
      if (!pendingMessage.succeeded && !pendingMessage.failed) {
        await sendFunc(token);
        pendingMessage.succeeded = true;
        stillPending.push(pendingMessage);
      } else if (pendingMessage.succeeded) {
        if (!messages.some((pm) => pm.clientId === pendingMessage.clientId)) {
          stillPending.push(pendingMessage);
        }
      } else {
        stillPending.push(pendingMessage);
      }
    } catch (e) {
      if (e instanceof AuthError) {
        // reauth and retry
        await reauth(sendFunc, dispatch);
        return;
      }

      if (pendingMessage.retries < 5) {
        pendingMessage.retries += 1;
      } else {
        pendingMessage.failed = true;
      }

      stillPending.push(pendingMessage);
    }
  }
  setPendingMessages([...stillPending]);
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

const handleError = async (
  e: unknown,
  retryFunc: (token: string) => Promise<void>,
  setError: (message: string) => void,
  dispatch: AppDispatch
) => {
  if (e instanceof AuthError) {
    // reauth and retry
    await reauth(retryFunc, dispatch);
    return;
  } else if (e instanceof ChatError) {
    setError(e.message);
    return;
  }
  setError("unable to connect to server");
};
