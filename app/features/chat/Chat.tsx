import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Banner, HelperText, Surface, useTheme } from "react-native-paper";
import { useChat } from "./hooks";
import styled from "styled-components";
import {
  FlatList,
  KeyboardAvoidingView,
  ListRenderItemInfo,
  Platform,
  View,
} from "react-native";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";
import { isMessage, Message, PendingMessage } from "../../domain";
import { NativeSyntheticEvent } from "react-native/Libraries/Types/CoreEventTypes";
import { NativeScrollEvent } from "react-native/Libraries/Components/ScrollView/ScrollView";
import { useHeaderHeight } from "@react-navigation/elements";
import { Menu } from "../menu/Menu";
import { useNavigation } from "@react-navigation/native";

type OnEndReachedFunc =
  | ((info: { distanceFromEnd: number }) => void)
  | null
  | undefined;
type OnScrollFunc = (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
type RenderItemFunc = (
  item: ListRenderItemInfo<Message | PendingMessage>
) => JSX.Element;

export const Chat: React.FunctionComponent = () => {
  const navigation = useNavigation();
  const {
    messages,
    pendingMessages,
    removePendingMessage,
    sendMessage,
    resendMessage,
    position,
    error,
    radius,
  } = useChat();

  const listRef = useRef<FlatList>(null);
  const [atEndOfList, setAtEndOfList] = useState(false);
  const listData = [...messages, ...pendingMessages];
  const headerHeight = useHeaderHeight();
  const theme = useTheme();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <Menu currentRadius={radius} />,
    });
  }, [navigation, radius]);
  useLayoutEffect(() => {
    if (atEndOfList && listData.length > 0) {
      listRef?.current?.scrollToEnd({ animated: true });
    }
  }, [listData.length, listRef, atEndOfList]);

  const onReachedEndOfList = useMemo<OnEndReachedFunc>(() => {
    return () => setAtEndOfList(true);
  }, [setAtEndOfList]);

  const onScroll = useMemo<OnScrollFunc>(() => {
    return () => setAtEndOfList(false);
  }, [setAtEndOfList]);

  const renderItem = useMemo<RenderItemFunc>(() => {
    return (item) => {
      const { item: msg } = item;
      const key = isMessage(msg) ? msg.id : msg.clientId;
      return (
        <ChatBubble
          key={key}
          message={msg}
          resendMessage={resendMessage}
          removePendingMessage={removePendingMessage}
        />
      );
    };
  }, [removePendingMessage, resendMessage]);
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "position"}
      keyboardVerticalOffset={headerHeight}
    >
      <Styled.Chat theme={theme}>
        <Banner visible={!!error} elevation={3}>
          <Styled.ErrorText type="error">{error}</Styled.ErrorText>
        </Banner>
        <FlatList
          data={listData}
          ref={listRef}
          ListFooterComponent={<Styled.ChatLogFooter />}
          onScroll={onScroll}
          onEndReached={onReachedEndOfList}
          onEndReachedThreshold={0.1}
          renderItem={renderItem}
        />
        <ChatInput sendMessage={sendMessage} position={position} />
      </Styled.Chat>
    </KeyboardAvoidingView>
  );
};

const Styled = {
  Chat: styled(Surface)`
    background-color: ${({ theme }) => theme.colors.surfaceVariant};
    height: 100%;
  `,
  ErrorText: styled(HelperText)`
    text-align: center;
  `,
  ChatLogFooter: styled(View)`
    height: 20px;
    width: 100%;
  `,
};
