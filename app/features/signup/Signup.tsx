import React, { useEffect, useState } from "react";
import { Button, Surface, Text, TextInput, useTheme } from "react-native-paper";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppDispatch, RootStackParamList } from "../../../App";
import { useDispatch } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import styled from "styled-components";
import { ChatError, signup } from "../../api";
import { loginSlice } from "../login/loginSlice";

export type SignupProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Signup">;
};

type FormData = {
  email: string;
  username: string;
  password: string;
};

const onSubmit =
  (setError: (message: string) => void, dispatch: AppDispatch) =>
  async (data: FormData) => {
    try {
      const token = await signup(data.email, data.username, data.password);
      dispatch(loginSlice.actions.loggedIn({ token: token.token }));
      setError("");
    } catch (e) {
      if (e instanceof ChatError) {
        setError(e.message);
        return;
      }

      setError("unknown error");
    }
  };

export const Signup: React.FunctionComponent<SignupProps> = ({
  navigation,
}) => {
  const [error, setError] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    formState: {
      errors,
      isSubmitSuccessful,
      isSubmitting,
      isValid,
      isValidating,
    },
  } = useForm<FormData>({
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });

  const loading = isSubmitting;

  const disableSignupButton =
    !isValid && isValidating && isSubmitSuccessful && isSubmitting;

  useEffect(() => {
    if (isSubmitSuccessful && !error) {
      navigation.navigate("Chat");
    }
  }, [isSubmitSuccessful, error]);
  return (
    <Styled.Container theme={theme}>
      {error && (
        <Styled.RequestError style={{ color: theme.colors.error }}>
          {error}
        </Styled.RequestError>
      )}
      <Controller
        control={control}
        rules={{
          required: true,
          min: 5,
          max: 24,
          pattern:
            /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Styled.SignupTextInput
            label="email"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            textContentType="emailAddress"
            autoCapitalize="none"
            disabled={loading}
          />
        )}
        name="email"
      />
      {errors.email && (
        <Styled.InputError style={{ color: theme.colors.error }}>
          {errors.email.type === "required"
            ? "email required"
            : "invalid email address"}
        </Styled.InputError>
      )}
      <Controller
        control={control}
        rules={{
          required: true,
          min: 8,
          max: 24,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Styled.SignupTextInput
            label="username"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            disabled={loading}
            autoCapitalize="none"
          />
        )}
        name="username"
      />
      {errors.username && (
        <Styled.InputError style={{ color: theme.colors.error }}>
          {errors.username.type === "required"
            ? "username required"
            : "invalid username"}
        </Styled.InputError>
      )}
      <Controller
        control={control}
        rules={{
          required: true,
          min: 8,
          max: 24,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Styled.SignupTextInput
            label="password"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            secureTextEntry={true}
            disabled={loading}
          />
        )}
        name="password"
      />
      {errors.password && (
        <Styled.InputError style={{ color: theme.colors.error }}>
          {errors.password.type === "required"
            ? "password required"
            : "invalid password"}
        </Styled.InputError>
      )}
      <Styled.SignupButton
        mode="contained"
        onPress={handleSubmit(onSubmit(setError, dispatch))}
        loading={loading}
        disabled={disableSignupButton}
      >
        Create Account
      </Styled.SignupButton>
    </Styled.Container>
  );
};

const Styled = {
  Container: styled(Surface)`
    height: 100%;
    justify-content: center;
    padding-left: 10px;
    padding-right: 10px;
  `,
  SignupButton: styled(Button)`
    margin-top: 10px;
  `,
  SignupTextInput: styled(TextInput)`
    margin-top: 10px;
  `,
  InputError: styled(Text)`
    align-self: flex-end;
    padding-top: 5px;
    font-weight: bold;
  `,
  RequestError: styled(Text)`
    padding-bottom: 5px;
    align-self: center;
    font-weight: bold;
  `,
};
