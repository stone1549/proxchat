import { useDispatch, useSelector } from "react-redux";
import {
  keychainLoginAsync,
  loggedIn,
  loginAsync,
  selectError,
  selectLoading,
  selectToken,
  selectTriedKeychain,
  selectUsername,
} from "./features/login/loginSlice";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppDispatch } from "../App";
import { useIsomorphicLayoutEffect } from "react-redux/es/utils/useIsomorphicLayoutEffect";
import "react-native-get-random-values";
import { refreshToken } from "./api";

export type LoginFunc = (email: string, password: string) => void;
export const useAuth = () => {
  const token = useSelector(selectToken);
  const username = useSelector(selectUsername);
  const triedKeychain = useSelector(selectTriedKeychain);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const dispatch = useDispatch<AppDispatch>();

  const login = useMemo<LoginFunc>(() => {
    return (email: string, password: string) => {
      dispatch(loginAsync({ email, password }));
    };
  }, []);

  useInterval(
    async () => {
      if (token) {
        const newToken = await refreshToken(token);
        dispatch(loggedIn(newToken));
      }
    },
    1000 * 60 * 5,
    false
  );

  useEffect(() => {
    if (!token && !triedKeychain) {
      dispatch(keychainLoginAsync());
    }
  }, [token, triedKeychain]);

  return { token, username, login, triedKeychain, loading, error };
};

export const useInterval = (
  callback: () => void,
  delay: number | null,
  immediately = false
) => {
  const [firstRun, setFirstRun] = useState(true);
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

    const id = setInterval(() => savedCallback.current(), delay);

    return () => clearInterval(id);
  }, [delay]);

  if (firstRun) {
    if (immediately) {
      callback();
    }
    setFirstRun(false);
  }
};
