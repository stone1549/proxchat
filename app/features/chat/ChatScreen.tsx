import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native";
import { Secured } from "../secured/Secured";
import { Chat } from "./Chat";
import React from "react";
import { RootStackParamList } from "../../../App";

export const ChatScreen = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Chat">): JSX.Element => {
  return (
    <SafeAreaView>
      <Secured>
        <Chat />
      </Secured>
    </SafeAreaView>
  );
};
