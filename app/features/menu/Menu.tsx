import React from "react";
import { Menu as PaperMenu, IconButton } from "react-native-paper";
import { AppDispatch } from "../../../App";
import { loginSlice } from "../login/loginSlice";
import { useDispatch } from "react-redux";
import Keychain from "react-native-keychain";
import { useAuth } from "../../hooks";
import { SettingsDialog } from "./SettingsDialog";

const logout = (dispatch: AppDispatch, closeMenu: () => void) => async () => {
  await Keychain.resetGenericPassword();
  dispatch(loginSlice.actions.logout());
  closeMenu();
};

type MenuProps = {
  currentRadius: number;
  setRadius: (radius: number) => void;
};

export const Menu: React.FunctionComponent<MenuProps> = ({
  currentRadius,
  setRadius,
}) => {
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const [settingsVisible, setSettingsVisible] = React.useState(false);
  const openSettings = () => {
    setVisible(false);
    setSettingsVisible(true);
  };

  const dispatch = useDispatch<AppDispatch>();

  const { token } = useAuth();

  if (!token) {
    return null;
  }
  return (
    <>
      <PaperMenu
        visible={visible}
        onDismiss={closeMenu}
        anchor={<IconButton icon="menu" onPress={openMenu} />}
      >
        <PaperMenu.Item onPress={openSettings} title="Settings" />
        <PaperMenu.Item onPress={logout(dispatch, closeMenu)} title="Logout" />
      </PaperMenu>
      <SettingsDialog
        visible={settingsVisible}
        setVisible={setSettingsVisible}
        currentRadius={currentRadius}
        setRadius={setRadius}
      />
    </>
  );
};
