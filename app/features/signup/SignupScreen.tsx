import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native";
import React from "react";
import { RootStackParamList } from "../../../App";
import { Signup } from "./Signup";

export const SignupScreen = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Signup">): JSX.Element => {
  return (
    <SafeAreaView>
      <Signup navigation={navigation} />
    </SafeAreaView>
  );
};
