import React from "react";
import { Banner, HelperText, Surface, useTheme } from "react-native-paper";
import { useChat } from "../../hooks";
import styled from "styled-components";
import { FlatList } from "react-native";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";
import { isMessage } from "../../domain";

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
      <FlatList
        data={[...messages, ...pendingMessages]}
        renderItem={(msg) => {
          const key = isMessage(msg.item) ? msg.item.id : msg.item.tempId;
          return (
            <ChatBubble
              key={key}
              message={msg.item}
              resendMessage={resendMessage}
              removePendingMessage={removePendingMessage}
            />
          );
        }}
      />
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
