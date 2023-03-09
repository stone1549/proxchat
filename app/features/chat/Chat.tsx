import React from "react";
import { Banner, HelperText, Surface, useTheme } from "react-native-paper";
import { useAuth, useChat } from "../../hooks";
import styled from "styled-components";
import { ScrollView, Text } from "react-native";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";
import { hashPendingMessage } from "../../domain";

export const Chat: React.FunctionComponent = () => {
  const {
    messages,
    pendingMessages,
    removePendingMessage,
    sendMessage,
    resendMessage,
    position,
    error,
  } = useChat();
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
            resendMessage={resendMessage}
            removePendingMessage={removePendingMessage}
          />
        ))}
        {pendingMessages.map((pending) => (
          <ChatBubble
            key={hashPendingMessage(pending)}
            message={pending}
            removePendingMessage={removePendingMessage}
            resendMessage={resendMessage}
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
