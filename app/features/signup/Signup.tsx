import React, { useEffect, useState } from "react";
import {
  Button,
  SegmentedButtons,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppDispatch, RootStackParamList } from "../../../App";
import { useDispatch } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import styled from "styled-components";
import { signup, SignupError } from "../../api";
import { loginSlice } from "../login/loginSlice";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { Gender } from "../../domain";
import { enumKeys } from "../../utils";

export type SignupProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Signup">;
};

type FormData = {
  email: string;
  username: string;
  password: string;
  gender: string;
  age: string;
  topics: Set<string>;
};

const onSubmit =
  (setError: (message: string) => void, dispatch: AppDispatch) =>
  async (data: FormData) => {
    try {
      const token = await signup(
        data.email,
        data.username,
        data.password,
        data.gender as keyof typeof Gender,
        Number.parseInt(data.age),
        data.topics
      );
      dispatch(loginSlice.actions.loggedIn({ token: token.token }));
      setError("");
    } catch (e) {
      if (e instanceof SignupError) {
        setError(e.message);
        return;
      }

      setError("unknown error");
    }
  };

const genderButtons = () => {
  return enumKeys(Gender).map((g) => {
    return {
      label: g,
      value: g,
    };
  });
};

export const Signup: React.FunctionComponent<SignupProps> = ({
  navigation,
}) => {
  const [error, setError] = useState("");
  const dispatch = useDispatch<AppDispatch>();

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
    mode: "all",
    defaultValues: {
      email: "",
      username: "",
      password: "",
      gender: "",
      age: "",
      topics: new Set<string>(),
    },
  });

  const loading = isSubmitting;

  const disableSignupButton =
    !isValid || isValidating || (isSubmitSuccessful && !error) || isSubmitting;
  useEffect(() => {
    if (isSubmitSuccessful && !error) {
      navigation.navigate("Chat");
    }
  }, [isSubmitSuccessful, error]);

  const headerHeight = useHeaderHeight();
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
            <Styled.InputError theme={theme}>
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
            <Styled.InputError theme={theme}>
              {errors.password.type === "required"
                ? "password required"
                : "invalid password"}
            </Styled.InputError>
          )}
          <Controller
            control={control}
            rules={{
              validate: (value) => {
                if (!value) {
                  return false;
                }

                return enumKeys(Gender).includes(value as keyof typeof Gender);
              },
            }}
            render={({ field: { onChange, value } }) => (
              <Styled.SignupGenderInput
                onValueChange={onChange}
                value={(value as string) ? (value as string) : ""}
                buttons={genderButtons()}
              />
            )}
            name="gender"
          />
          {errors.gender && (
            <Styled.InputError theme={theme}>
              {errors.gender.type === "required"
                ? "gender required"
                : "invalid gender"}
            </Styled.InputError>
          )}
          <Controller
            control={control}
            rules={{
              required: true,
              pattern: /^[[1-9]+[0-9]*$/,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Styled.SignupTextInput
                label={"age"}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                inputMode={"numeric"}
                keyboardType={"numeric"}
                disabled={loading}
              />
            )}
            name="age"
          />
          {errors.age && (
            <Styled.InputError theme={theme}>
              {errors.age.type === "required" ? "age required" : "invalid age"}
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
  SignupButton: styled(Button)`
    margin-top: 10px;
  `,
  SignupTextInput: styled(TextInput)`
    margin-top: 10px;
  `,
  SignupGenderInput: styled(SegmentedButtons)`
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
