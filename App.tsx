import React from "react";
import {
  Provider as PaperProvider,
  MD3LightTheme,
  adaptNavigationTheme,
} from "react-native-paper";
import {
  NavigationContainer,
  DefaultTheme as NavigationLightTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider } from "react-redux";
import store from "./app/store";
import { ChatScreen } from "./app/features/chat/ChatScreen";
import { SignupScreen } from "./app/features/signup/SignupScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";

export type AppDispatch = typeof store.dispatch;

export type RootStackParamList = {
  Chat: undefined;
  Signup: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

const { LightTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationLightTheme,
});

const CombinedDarkTheme = {
  ...MD3LightTheme,
  ...LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...LightTheme.colors,
  },
};

function App(): JSX.Element {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={CombinedDarkTheme}>
        <Provider store={store}>
          <NavigationContainer theme={CombinedDarkTheme}>
            <RootStack.Navigator>
              <RootStack.Screen name="Chat" component={ChatScreen} />
              <RootStack.Screen name="Signup" component={SignupScreen} />
            </RootStack.Navigator>
          </NavigationContainer>
        </Provider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;
