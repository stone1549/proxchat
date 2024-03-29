import React, { useEffect } from "react";
import { Button, Surface, TextInput, useTheme } from "react-native-paper";
import styled from "styled-components";
import { Controller, useForm } from "react-hook-form";
import { Location } from "../../domain";
import { Keyboard } from "react-native";

type FormData = {
  message: "";
};

const onSubmit =
  (
    position: Location | undefined,
    sendMessage: (content: string, location: Location) => void
  ) =>
  (data: FormData) => {
    if (position === undefined) {
      return;
    }

    Keyboard.dismiss();
    sendMessage(data.message, position);
  };

export type ChatInputProps = {
  sendMessage: (content: string, location: Location) => void;
  position: Location | undefined;
};

export const ChatInput: React.FunctionComponent<ChatInputProps> = ({
  sendMessage,
  position,
}) => {
  const {
    control,
    handleSubmit,
    formState: {
      errors,
      isSubmitted,
      isSubmitSuccessful,
      isSubmitting,
      isValid,
      isValidating,
    },
    reset: resetForm,
  } = useForm<FormData>({
    defaultValues: {
      message: "",
    },
  });

  useEffect(() => {
    if (isSubmitted && isSubmitSuccessful) {
      resetForm();
    } else if (isSubmitted && errors.root) {
      resetForm();
    }
  }, [isSubmitted, isSubmitSuccessful]);
  const enableSendButton =
    !isSubmitted &&
    !isSubmitSuccessful &&
    !isSubmitting &&
    !isValidating &&
    isValid;

  const theme = useTheme();
  return (
    <Styled.ChatInput elevation={1} theme={theme}>
      <Controller
        control={control}
        rules={{
          required: true,
          min: 1,
          max: 500,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Styled.ChatTextInput
            mode="outlined"
            outlineStyle={{ borderRadius: 50 }}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
        name="message"
      />
      <Button
        mode="elevated"
        onPress={handleSubmit(onSubmit(position, sendMessage))}
        disabled={!enableSendButton}
      >
        Send
      </Button>
    </Styled.ChatInput>
  );
};

const Styled = {
  ChatInput: styled(Surface)`
    background-color: ${({ theme }) => theme.colors.surfaceVariant};
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 5px;
  `,
  ChatTextInput: styled(TextInput)`
    width: 75%;
  `,
};
