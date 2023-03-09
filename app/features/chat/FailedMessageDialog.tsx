import React from "react";
import {Button, Dialog, MD3Colors, Portal, Text} from "react-native-paper";
import {Message, PendingMessage} from "../../domain";

export type FailedMessageDialogProps = {
  dialogVisible: boolean,
  hideDialog: () => void,
  removePendingMessage: (message: Message|PendingMessage) => void,
  resendMessage: (message: PendingMessage)  => void,
  message: PendingMessage,
};

export const FailedMessageDialog: React.FunctionComponent<FailedMessageDialogProps> = ({
    dialogVisible,
    hideDialog,
    removePendingMessage,
    message,
    resendMessage,
  }) => {
  return (
<Portal>
  <Dialog visible={dialogVisible} onDismiss={hideDialog}>
    <Dialog.Content>
      <Text>Message failed to send</Text>
    </Dialog.Content>
    <Dialog.Actions>
      <Button onPress={() => {
        removePendingMessage(message);
      }}><Text style={{color: MD3Colors.error50}}>Delete</Text></Button>
      <Button onPress={() => {
        removePendingMessage(message);
        resendMessage(message);
        hideDialog();
      }}><Text>Resend</Text></Button>
    </Dialog.Actions>
  </Dialog>
</Portal>
  );
}