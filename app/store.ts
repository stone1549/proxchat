import { combineReducers, configureStore } from "@reduxjs/toolkit";
import loginSlice from "./features/login/loginSlice";

const rootReducer = combineReducers({
  login: loginSlice,
});
export type RootState = ReturnType<typeof rootReducer>;

export default configureStore({
  reducer: rootReducer,
});
