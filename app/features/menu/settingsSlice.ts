import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { Units, UnitSystems } from "../../utils";
import Config from "react-native-config";

type SetRadiusSettingsActionPayload = {
  unitSystem: UnitSystems;
  units: Units;
  radiusInMeters: number;
};

type State = {
  unitSystem: UnitSystems;
  units: Units;
  radiusInMeters: number;
};

const initialState: State = {
  unitSystem: UnitSystems.metric,
  units: Units.m,
  radiusInMeters: Config.CHAT_RADIUS
    ? Number.parseFloat(Config.CHAT_RADIUS)
    : 100,
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setRadiusSettings: (
      state,
      action: PayloadAction<SetRadiusSettingsActionPayload>
    ) => {
      const { payload } = action;
      state.unitSystem = payload.unitSystem;
      state.units = payload.units;
      state.radiusInMeters = payload.radiusInMeters;
    },
  },
});

export const selectUnitSystem = (state: RootState) => state.settings.unitSystem;
export const selectUnits = (state: RootState) => state.settings.units;
export const selectRadiusInMeters = (state: RootState) =>
  state.settings.radiusInMeters;

export const { setRadiusSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
