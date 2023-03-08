import React from "react";
import { Card, Text, useTheme } from "react-native-paper";
import { isMessage, Message, PendingMessage } from "../../domain";
import styled from "styled-components";

export type ChatBubbleProps = {
  message: Message | PendingMessage;
  ownMessage: boolean;
};

export const ChatBubble: React.FunctionComponent<ChatBubbleProps> = ({
  message,
  ownMessage,
}) => {
  const theme = useTheme();
  const { sender, content } = message;

  const pending = !isMessage(message);

  let attributeOverride = {};
  if (pending) {
    attributeOverride = {
      style: {
        backgroundColor: "#FF0000",
      },
    };
  }
  return (
    <Styled.ChatBubble theme={theme} elevation={1} {...attributeOverride}>
      <Styled.ChatBubbleContent theme={theme}>
        <Styled.ChatBubbleContentText>
          <Styled.ChatBubbleLabel theme={theme}>
            {sender.username}
          </Styled.ChatBubbleLabel>
          : {content}
        </Styled.ChatBubbleContentText>
      </Styled.ChatBubbleContent>
    </Styled.ChatBubble>
  );
};

const Styled = {
  ChatBubble: styled(Card)`
    border-radius: 10px;
    margin-left: 10px;
    margin-right: 10px;
    margin-top: 5px;
  `,
  ChatBubbleLabel: styled(Text)`
    font-weight: bold;
  `,
  ChatBubbleContent: styled(Card.Content)``,
  ChatBubbleContentText: styled(Text)``,
};
