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
import { useEffect, useRef } from "react";
import { AppDispatch } from "../App";
import { auth } from "./api";
import { useIsomorphicLayoutEffect } from "react-redux/es/utils/useIsomorphicLayoutEffect";
import Keychain from "react-native-keychain";
import "react-native-get-random-values";

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
