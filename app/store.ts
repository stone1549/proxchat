import { combineReducers, configureStore } from "@reduxjs/toolkit";
import loginSlice from "./features/login/loginSlice";
import settingsSlice from "./features/menu/settingsSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistStore, persistReducer } from "redux-persist";
import thunk from "redux-thunk";
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
  login: loginSlice,
  settings: settingsSlice,
});
export type RootState = ReturnType<typeof rootReducer>;

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(thunk),
});

export const persistor = persistStore(store);
