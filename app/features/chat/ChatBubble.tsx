import React, { useState } from "react";
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
import { useSelector } from "react-redux";
import { selectUnitSystem } from "../menu/settingsSlice";
import { convertToDesiredUnits, Units, UnitSystems } from "../../utils";
import { RemovePendingMessageFunc } from "./hooks";
import { DateTime } from "luxon";

export type ChatBubbleProps = {
  message: Message | PendingMessage;
  removePendingMessage: RemovePendingMessageFunc;
  resendMessage: (message: PendingMessage) => void;
};

const displayTimeSince = (ts: DateTime) => {
  const durationObject = ts
    .diffNow(["year", "month", "week", "day", "hour", "minute", "second"])
    .toObject();
  const years = Math.round(Math.abs(durationObject.years || 0));
  const months = Math.round(Math.abs(durationObject.months || 0));
  const weeks = Math.round(Math.abs(durationObject.weeks || 0));
  const days = Math.round(Math.abs(durationObject.days || 0));
  const hours = Math.round(Math.abs(durationObject.hours || 0));
  const minutes = Math.round(Math.abs(durationObject.minutes || 0));
  const seconds = Math.round(Math.abs(durationObject.seconds || 0));

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

const displayDistance = (distanceInMeters: number, unitSystem: UnitSystems) => {
  switch (unitSystem) {
    case UnitSystems.metric:
      const km = distanceInMeters / 1000;

      if (km > 0.5) {
        return `${km.toFixed()}km away`;
      }
      return `${distanceInMeters.toFixed()}m away`;
    case UnitSystems.standard:
      const inMiles = convertToDesiredUnits(
        distanceInMeters,
        Units.m,
        Units.mi
      );
      const inFeet = convertToDesiredUnits(distanceInMeters, Units.m, Units.ft);

      if (inMiles < 0.1) {
        return `${inFeet.toFixed(2)}ft away`;
      }
      return `${inMiles.toFixed(2)} miles away`;
    default:
      throw new Error("unsupported unit type");
  }
};

export const ChatBubble: React.FunctionComponent<ChatBubbleProps> = ({
  message,
  removePendingMessage,
  resendMessage,
}) => {
  const { username } = useAuth();
  const theme = useTheme();
  const [dialogVisible, setDialogVisible] = useState(false);
  const unitSystem = useSelector(selectUnitSystem);

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
        color: theme.colors.onPrimaryContainer,
      },
    };
  }

  return (
    <Styled.ChatBubble elevation={1} {...attributeOverrides}>
      <Styled.ChatBubbleLabel>
        {ownMessage ? "" : sender.username}{" "}
        {!ownMessage &&
          isMessage(message) &&
          `(${displayDistance(message.distanceInMeters, unitSystem)}) `}
        {isMessage(message)
          ? displayTimeSince(message.receivedAt)
          : displayTimeSince(message.sentAt)}
      </Styled.ChatBubbleLabel>
      <Styled.ChatBubbleContent>
        <Styled.ChatBubbleContentText>{content}</Styled.ChatBubbleContentText>
        {pending && !failed && <ActivityIndicator />}
        {failed && (
          <IconButton
            icon="alert"
            iconColor={MD3Colors.error50}
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
