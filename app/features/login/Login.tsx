import React, { useMemo } from "react";
import { TextInput, Text, Button, Surface, useTheme } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import styled from "styled-components";
import { RootStackParamList } from "../../../App";
import { useAuth } from "../../hooks";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";

type FormData = {
  email: string;
  password: string;
};

export type LoginProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const Login: React.FunctionComponent<LoginProps> = ({ navigation }) => {
  const {
    token,
    triedKeychain,
    loading: authLoading,
    error,
    login,
  } = useAuth();

  const headerHeight = useHeaderHeight();

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

  const onSubmit = useMemo(() => {
    return (data: FormData) => {
      const { email, password } = data;
      login(email, password);
    };
  }, [login]);

  const theme = useTheme();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "position"}
      keyboardVerticalOffset={headerHeight}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Styled.Container>
          {error && (
            <Styled.RequestError theme={theme}>{error}</Styled.RequestError>
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
            <Styled.InputError theme={theme}>
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
            <Styled.InputError theme={theme}>
              {errors.password.type === "required"
                ? "password required"
                : "invalid password"}
            </Styled.InputError>
          )}
          <Styled.LoginButton
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={loading}
          >
            Login
          </Styled.LoginButton>
          <Styled.LoginButton
            mode="outlined"
            onPress={() => navigation.navigate("Signup")}
            loading={loading}
            disabled={loading}
          >
            Signup
          </Styled.LoginButton>
        </Styled.Container>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    color: ${({ theme }) => theme.colors.error};
    align-self: flex-end;
    padding-top: 5px;
    font-weight: bold;
  `,
  RequestError: styled(Text)`
    color: ${({ theme }) => theme.colors.error};
    padding-bottom: 5px;
    align-self: center;
    font-weight: bold;
  `,
};

export default Login;
