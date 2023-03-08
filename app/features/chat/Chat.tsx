import React from "react";
import { Banner, HelperText, Surface, useTheme } from "react-native-paper";
import { useAuth, useChat } from "../../hooks";
import styled from "styled-components";
import { ScrollView, Text } from "react-native";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";
import { hashPendingMessage } from "../../domain";

export const Chat: React.FunctionComponent = () => {
  const { messages, pendingMessages, sendMessage, position, error } = useChat();
  const { username } = useAuth();
  const theme = useTheme();

  return (
    <Styled.Chat theme={theme}>
      <Banner visible={!!error} theme={theme} elevation={3}>
        <Styled.ErrorText type="error">{error}</Styled.ErrorText>
      </Banner>
      <ScrollView>
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            ownMessage={msg.sender.username === username}
          />
        ))}
        {pendingMessages.map((pending) => (
          <ChatBubble
            key={hashPendingMessage(pending)}
            message={pending}
            ownMessage={true}
          />
        ))}
      </ScrollView>
      <ChatInput sendMessage={sendMessage} position={position} />
    </Styled.Chat>
  );
};

const Styled = {
  Chat: styled(Surface)`
    background-color: ${({ theme }) => theme.colors.surfaceVariant};
    height: 100%;
  `,
  ErrorText: styled(HelperText)`
    text-align: center;
  `,
};
