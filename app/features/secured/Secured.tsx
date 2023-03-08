import React from "react";
import { useAuth } from "../../hooks";
import Login from "../login/Login";

export const Secured = (props: React.PropsWithChildren<any>) => {
  const { token } = useAuth();

  if (token) {
    return props.children;
  }

  return <Login />;
};
