import React from "react";
import { useAuth } from "../../hooks";
import Login from "../login/Login";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../App";

export type SecuredProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
} & React.PropsWithChildren<any>;

export const Secured: React.FunctionComponent<SecuredProps> = ({
  navigation,
  children,
}) => {
  const { token } = useAuth();

  if (token) {
    return children;
  }

  return <Login navigation={navigation} />;
};
