import React from "react";
import {
  ActivityIndicator,
  Button,
  Card,
  Dialog,
  IconButton,
  MD3Colors,
  Portal,
  Text,
  useTheme,
} from "react-native-paper";
import { isMessage, Location, Message, PendingMessage } from "../../domain";
import styled from "styled-components";
import { useAuth } from "../../hooks";
import { FailedMessageDialog } from "./FailedMessageDialog";

export type ChatBubbleProps = {
  message: Message | PendingMessage;
  removePendingMessage: (msg: PendingMessage | Message) => void;
  resendMessage: (message: PendingMessage) => void;
};

export const ChatBubble: React.FunctionComponent<ChatBubbleProps> = ({
  message,
  removePendingMessage,
  resendMessage,
}) => {
  const { username } = useAuth();
  const theme = useTheme();
  const [dialogVisible, setDialogVisible] = React.useState(false);

  const showDialog = () => setDialogVisible(true);

  const hideDialog = () => setDialogVisible(false);

  const { sender, content } = message;

  const pending = !isMessage(message);
  const failed = pending && message.failed;

  let attributeOverrides = {};

  const ownMessage = username === sender.username;
  if (pending || ownMessage) {
    attributeOverrides = {
      style: {
        backgroundColor: theme.colors.primaryContainer,
        color: theme.colors.onPrimary,
      },
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
        {pending && !failed && <ActivityIndicator theme={theme} />}
        {failed && (
          <IconButton
            icon="alert"
            iconColor={MD3Colors.error50}
            theme={theme}
            onPress={showDialog}
          />
        )}
      </Styled.ChatBubbleContent>
      <FailedMessageDialog
        dialogVisible={dialogVisible}
        hideDialog={hideDialog}
        removePendingMessage={removePendingMessage}
        resendMessage={resendMessage}
        message={message as PendingMessage}
      />
    </Styled.ChatBubble>
  );
};

const Styled = {
  ChatBubble: styled(Card)`
    border-radius: 10px;
    margin-left: 10px;
    margin-right: 10px;
    margin-top: 5px;
    padding-bottom: 10px;
    padding-top: 0px;
  `,
  ChatBubbleLabel: styled(Text)`
    font-weight: bold;
  `,
  ChatBubbleContent: styled(Card.Content)`
    flex-direction: row;
    justify-content: center;
  `,
  ChatBubbleContentText: styled(Text)`
    display: flex;
    flex: 1;
  `,
  ChatBubbleAlertIcon: styled(IconButton)``,
};
