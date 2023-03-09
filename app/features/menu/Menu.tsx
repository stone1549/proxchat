import React from "react";
import { Menu as PaperMenu, IconButton } from "react-native-paper";
import { AppDispatch } from "../../../App";
import { loginSlice } from "../login/loginSlice";
import { useDispatch } from "react-redux";
import Keychain from "react-native-keychain";
import { useAuth } from "../../hooks";

const logout = (dispatch: AppDispatch, closeMenu: () => void) => async () => {
  await Keychain.resetGenericPassword();
  dispatch(loginSlice.actions.logout());
  closeMenu();
};

export const Menu: React.FunctionComponent = () => {
  const [visible, setVisible] = React.useState(false);

  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);
  const dispatch = useDispatch<AppDispatch>();

  const { token } = useAuth();

  if (!token) {
    return null;
  }
  return (
    <PaperMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<IconButton icon="menu" onPress={openMenu} />}
    >
      <PaperMenu.Item onPress={logout(dispatch, closeMenu)} title="Logout" />
    </PaperMenu>
  );
};
