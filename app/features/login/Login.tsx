import React from "react";
import { TextInput, Text, Button, useTheme, Surface } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { loginAsync } from "./loginSlice";
import { AppDispatch } from "../../../App";
import { useAuth } from "../../hooks";

type FormData = {
  email: string;
  password: string;
};

const onSubmit = (dispatch: AppDispatch) => (data: FormData) => {
  dispatch(loginAsync({ ...data }));
};

const Login: React.FunctionComponent = () => {
  const { token, triedKeychain, loading: authLoading, error } = useAuth();

  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loading = authLoading || !triedKeychain || token != "";

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
          <Styled.LoginTextInput
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
          <Styled.LoginTextInput
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
      <Styled.LoginButton
        mode="contained"
        onPress={handleSubmit(onSubmit(dispatch))}
        loading={loading}
        disabled={loading}
      >
        Login
      </Styled.LoginButton>
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
  LoginButton: styled(Button)`
    margin-top: 10px;
  `,
  LoginTextInput: styled(TextInput)`
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

export default Login;
