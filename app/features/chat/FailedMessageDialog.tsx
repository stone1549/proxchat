import React from "react";
import { Button, Dialog, Portal, Text, useTheme } from "react-native-paper";
import { PendingMessage } from "../../domain";
import styled from "styled-components";
import { RemovePendingMessageFunc } from "./hooks";

export type FailedMessageDialogProps = {
  dialogVisible: boolean;
  hideDialog: () => void;
  removePendingMessage: RemovePendingMessageFunc;
  resendMessage: (message: PendingMessage) => void;
  message: PendingMessage;
};

export const FailedMessageDialog: React.FunctionComponent<
  FailedMessageDialogProps
> = ({
  dialogVisible,
  hideDialog,
  removePendingMessage,
  message,
  resendMessage,
}) => {
  const theme = useTheme();
  return (
    <Portal>
      <Dialog visible={dialogVisible} onDismiss={hideDialog}>
        <Dialog.Content>
          <Text>Message failed to send</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            onPress={() => {
              removePendingMessage(message.clientId);
            }}
          >
            <Styled.ErrorText theme={theme}>Delete</Styled.ErrorText>
          </Button>
          <Button
            onPress={() => {
              removePendingMessage(message.clientId);
              resendMessage(message);
              hideDialog();
            }}
          >
            <Text>Resend</Text>
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const Styled = {
  ErrorText: styled(Text)`
    color: ${({ theme }) => theme.colors.error};
  `,
};
