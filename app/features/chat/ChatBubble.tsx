import React from "react";
import {ActivityIndicator, Card, IconButton, MD3Colors, Text, useTheme} from "react-native-paper";
import { isMessage, Message, PendingMessage } from "../../domain";
import styled from "styled-components";
import {useAuth} from "../../hooks";

export type ChatBubbleProps = {
  message: Message | PendingMessage;
  ownMessage: boolean;
};

export const ChatBubble: React.FunctionComponent<ChatBubbleProps> = ({
  message,
}) => {
  const {username} = useAuth();
  const theme = useTheme();
  const { sender, content } = message;

  const pending = !isMessage(message);
  const failed = pending && message.failed;
  const isOwnMessage = username === sender.username;

  let attributeOverrides = {};

  if (pending || isOwnMessage) {
    attributeOverrides = {
      style: {
        backgroundColor: theme.colors.primaryContainer,
        color: theme.colors.onPrimary,
      }
    };
  }
  return (
    <Styled.ChatBubble theme={theme} elevation={1} {...attributeOverrides}>
      <Styled.ChatBubbleContent theme={theme}>
        <Styled.ChatBubbleContentText>
          <Styled.ChatBubbleLabel theme={theme}>
            {sender.username}
          </Styled.ChatBubbleLabel>
          : {content}
        </Styled.ChatBubbleContentText>
        {pending && !failed &&
            <ActivityIndicator theme={theme} />
        }
        {
          failed &&
            <IconButton icon="alert" iconColor={MD3Colors.error50} theme={theme} />
        }
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
  ChatBubbleContent: styled(Card.Content)`
    flex-direction: row;
  `,
  ChatBubbleContentText: styled(Text)`
    display: flex;
    flex: 1;
  `,
  ChatBubbleAlertIcon: styled(IconButton)`
  `,
};
