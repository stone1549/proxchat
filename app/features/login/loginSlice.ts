import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { auth, AuthError } from "../../api";
import * as Keychain from "react-native-keychain";

type LoggedInActionPayload = {
  username: string;
  token: string;
};
type LoginArg = {
  email: string;
  password: string;
};

interface LoginError {
  status: number;
  message: string;
}

export const loginAsync = createAsyncThunk<
  LoggedInActionPayload,
  LoginArg,
  { rejectValue: LoginError }
>(
  "login",
  // Declare the type your function argument here:
  async (arg, thunkAPI) => {
    try {
      const resp = await auth(arg.email, arg.password);
      await Keychain.setGenericPassword(arg.email, arg.password);
      return { username: arg.email, token: resp.token };
    } catch (e) {
      if (e instanceof AuthError) {
        return thunkAPI.rejectWithValue({
          status: e.status,
          message: e.message,
        });
      }

      return thunkAPI.rejectWithValue({ status: 500, message: "uknown error" });
    }
  }
);

export const keychainLoginAsync = createAsyncThunk<
  LoggedInActionPayload,
  void,
  { rejectValue: LoginError }
>(
  "keychain",
  // Declare the type your function argument here:
  async (arg, thunkAPI) => {
    try {
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        const resp = await auth(credentials.username, credentials.password);
        return { username: credentials.username, token: resp.token };
      }

      return thunkAPI.rejectWithValue({
        status: 0,
        message: "not stored in keychain",
      });
    } catch (e) {
      if (e instanceof AuthError) {
        await Keychain.resetGenericPassword();
        return thunkAPI.rejectWithValue({
          status: e.status,
          message: e.message,
        });
      }

      return thunkAPI.rejectWithValue({ status: 500, message: "uknown error" });
    }
  }
);

type State = {
  username: string;
  token: string;
  loading: boolean;
  triedKeychain: boolean;
  error: string | undefined;
};

const initialState: State = {
  username: "",
  token: "",
  loading: false,
  triedKeychain: false,
  error: undefined,
};

type LoginAction = {
  token: string;
  username: string;
};

export const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    logout: (state) => {
      state.username = "";
      state.token = "";
      state.loading = false;
      state.triedKeychain = false;
      state.error = undefined;
    },
    login: (state, action: PayloadAction<LoginAction>) => {
      const { payload } = action;
      state.username = payload.username;
      state.token = payload.token;
      state.loading = false;
      state.triedKeychain = false;
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginAsync.fulfilled, (state, { payload }) => {
      state.username = payload.username;
      state.token = payload.token;
      state.loading = false;
      state.error = undefined;
      state.triedKeychain = false;
    });
    builder.addCase(loginAsync.rejected, (state, { payload }) => {
      state.username = "";
      state.token = "";
      state.loading = false;
      state.error = payload?.message;
    });
    builder.addCase(loginAsync.pending, (state, _) => {
      state.username = "";
      state.token = "";
      state.loading = true;
      state.error = undefined;
    });
    builder.addCase(keychainLoginAsync.fulfilled, (state, { payload }) => {
      state.username = payload.username;
      state.token = payload.token;
      state.loading = false;
      state.error = undefined;
      state.triedKeychain = false;
    });
    builder.addCase(keychainLoginAsync.rejected, (state, _) => {
      state.username = "";
      state.token = "";
      state.loading = false;
      state.error = undefined;
      state.triedKeychain = true;
    });
    builder.addCase(keychainLoginAsync.pending, (state, _) => {
      state.username = "";
      state.token = "";
      state.loading = true;
      state.error = undefined;
      state.triedKeychain = false;
    });
  },
});

export const selectUsername = (state: RootState) => state.login.username;
export const selectToken = (state: RootState) => state.login.token;
export const selectLoading = (state: RootState) => state.login.loading;
export const selectTriedKeychain = (state: RootState) =>
  state.login.triedKeychain;
export const selectError = (state: RootState) => state.login.error;

export const { logout, login } = loginSlice.actions;
export default loginSlice.reducer;
