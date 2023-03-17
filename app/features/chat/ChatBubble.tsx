import React from "react";
import {
  ActivityIndicator,
  Card,
  IconButton,
  MD3Colors,
  Text,
  useTheme,
} from "react-native-paper";
import { isMessage, Message, PendingMessage } from "../../domain";
import styled from "styled-components";
import { useAuth } from "../../hooks";
import { FailedMessageDialog } from "./FailedMessageDialog";
import moment from "moment";

export type ChatBubbleProps = {
  message: Message | PendingMessage;
  removePendingMessage: (msg: PendingMessage | Message) => void;
  resendMessage: (message: PendingMessage) => void;
};

const displayTimeSince = (createdAt: moment.Moment) => {
  const now = moment();
  const years = now.diff(createdAt, "year");
  const months = now.diff(createdAt, "month");
  const weeks = now.diff(createdAt, "week");
  const days = now.diff(createdAt, "days");
  const hours = now.diff(createdAt, "hour");
  const minutes = now.diff(createdAt, "minute");
  const seconds = now.diff(createdAt, "second");

  if (years !== 0) {
    if (months < 3) {
      return `${years} year${years > 1 ? "s" : ""} ago`;
    } else if (months < 10) {
      return `over ${years} year${years > 1 ? "s" : ""} ago`;
    } else {
      return `almost ${years + 1} years ago`;
    }
  } else if (months !== 0) {
    return `${months} month${months > 1 ? "s" : ""} ago`;
  } else if (weeks !== 0) {
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  } else if (days !== 0) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (hours !== 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (minutes !== 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else {
    return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
  }
};

const displayDistance = (distanceInMeters: number) => {
  const km = distanceInMeters / 1000;

  if (km > 0.5) {
    return `${km.toFixed()}km away`;
  } else {
    return `${distanceInMeters.toFixed()}m away`;
  }
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
      <Styled.ChatBubbleLabel theme={theme}>
        {ownMessage ? "" : sender.username}{" "}
        {!ownMessage &&
          isMessage(message) &&
          `(${displayDistance(message.distanceInMeters)}) `}
        {displayTimeSince(message.createdAt)}
      </Styled.ChatBubbleLabel>
      <Styled.ChatBubbleContent theme={theme}>
        <Styled.ChatBubbleContentText>{content}</Styled.ChatBubbleContentText>
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
    padding-top: 5px;
  `,
  ChatBubbleLabel: styled(Text)`
    font-size: 10px;
    font-weight: bold;
    align-self: center;
  `,
  ChatBubbleContent: styled(Card.Content)`
    flex-direction: row;
    justify-content: center;
  `,
  ChatBubbleContentText: styled(Text)`
    padding-top: 5px;
    font-size: 16px;
    display: flex;
    flex: 1;
  `,
  ChatBubbleAlertIcon: styled(IconButton)``,
};
