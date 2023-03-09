import { useDispatch, useSelector } from "react-redux";
import {
  keychainLoginAsync,
  login,
  logout,
  selectError,
  selectLoading,
  selectToken,
  selectTriedKeychain,
  selectUsername,
} from "./features/login/loginSlice";
import { useEffect, useRef, useState } from "react";
import { AppDispatch } from "../App";
import { Location, Message, PendingMessage } from "./domain";
import Geolocation from "@react-native-community/geolocation";
import { auth, AuthError, ChatError, pollChat, send } from "./api";
import moment from "moment/moment";
import { useIsomorphicLayoutEffect } from "react-redux/es/utils/useIsomorphicLayoutEffect";
import { isEqual } from "lodash";
import Keychain from "react-native-keychain";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { getSenderFromToken } from "./utils";

const CHAT_POLL_MS = 5000;
const GPS_POLL_MS = 300000;

const match = (pending: PendingMessage, message: Message | PendingMessage) => {
  return (
    pending.content === message.content &&
    isEqual(pending.sender, message.sender) &&
    isEqual(pending.location, message.location)
  );
};

export const useChat = () => {
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [pendingMessages, setPendingMessages] = useState<Array<PendingMessage>>(
    []
  );
  const [error, setError] = useState("");
  const { position } = usePosition();
  const { token } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const addPendingMessage = (pending: PendingMessage) => {
    setPendingMessages([...pendingMessages, pending]);
  };

  const removePendingMessage = (message: Message | PendingMessage) => {
    for (const [index, pending] of pendingMessages.entries()) {
      if (match(pending, message)) {
        const before = pendingMessages.slice(0, index);
        const after = pendingMessages.slice(index + 1);
        setPendingMessages([...before, ...after]);
      }
    }
  };

  useInterval(
    async () => {
      if (position !== undefined) {
        let after = moment().subtract(10, "minutes");

        if (messages.length > 0) {
          after = messages[messages.length - 1].createdAt;
        }

        const poll = async (token: string) => {
          setPendingMessages([
            ...pendingMessages.map((pending) => {
              if (
                pending.createdAt.isBefore(
                  moment().subtract(CHAT_POLL_MS * 3, "millisecond")
                )
              ) {
                pending.failed = true;
              }

              return pending;
            }),
          ]);
          const newMessages = await pollChat(position, after, token);
          setError("");
          if (newMessages.length > 0) {
            for (const newMessage of newMessages) {
              removePendingMessage(newMessage);
            }
            setMessages([...messages, ...newMessages]);
          }
        };

        try {
          await poll(token);
        } catch (e) {
          if (e instanceof AuthError) {
            // reauth and retry
            await reauth(poll, dispatch);
            return;
          } else if (e instanceof ChatError) {
            setError(e.message);
            return;
          }
          setError("unable to connect to server");
        }
      }
    },
    CHAT_POLL_MS,
    true
  );

  const sendMessage = async (content: string, position: Location) => {
    const sendFunc = async (token: string) => {
      await send(content, position, token);
    };
    try {
      addPendingMessage({
        tempId: uuidv4(),
        content,
        sender: getSenderFromToken(token),
        location: position,
        retries: 0,
        failed: false,
        createdAt: moment(),
      });
      await sendFunc(token);
    } catch (e) {
      if (e instanceof AuthError) {
        // reauth and retry
        await reauth(sendFunc, dispatch);
        setError("");
        return;
      } else if (e instanceof ChatError) {
        setError(e.message);
        return;
      }

      setError("unable to send");
    }
  };

  const resendMessage = async (message: PendingMessage) => {
    const sendFunc = async (token: string) => {
      await send(message.content, message.location, token);
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
              tempId: message.tempId,
              sender: message.sender,
            },
            ...pendingMessages.slice(index + 1),
          ]);
          break;
        }
      }
      await sendFunc(token);
    } catch (e) {
      if (e instanceof AuthError) {
        // reauth and retry
        await reauth(sendFunc, dispatch);
        setError("");
        return;
      } else if (e instanceof ChatError) {
        setError(e.message);
        return;
      }

      setError("unable to send");
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
  };
};

export const reauth = async (
  retryFunction: (token: string) => Promise<void>,
  dispatch: AppDispatch
): Promise<void> => {
  const creds = await Keychain.getGenericPassword();
  if (creds) {
    const tokResp = await auth(creds.username, creds.password);
    dispatch(login(tokResp));
    try {
      await retryFunction(tokResp.token);
    } catch (e) {
      dispatch(logout());
    }
  }
};

export const useAuth = () => {
  const token = useSelector(selectToken);
  const username = useSelector(selectUsername);
  const triedKeychain = useSelector(selectTriedKeychain);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!token && !triedKeychain) {
      dispatch(keychainLoginAsync());
    }
  }, [token, triedKeychain]);

  return { token, username, triedKeychain, loading, error };
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

export const useInterval = (
  callback: () => void,
  delay: number | null,
  immediately = false
) => {
  const savedCallback = useRef(callback);

  // Remember the latest callback if it changes.
  useIsomorphicLayoutEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    // Note: 0 is a valid value for delay.
    if (!delay && delay !== 0) {
      return;
    }

    if (immediately) {
      callback();
    }
    const id = setInterval(() => savedCallback.current(), delay);

    return () => clearInterval(id);
  }, [delay]);
};
