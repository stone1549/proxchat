import React, { useEffect, useMemo, useRef, useState } from "react";
import { TextInput as NativeTextInput } from "react-native";
import { Noop } from "react-hook-form";
import {
  convertToDesiredUnits,
  convertToMeters,
  getStoredRadius,
  getStoredRadiusUnitsSetting,
  getStoredUnitsSystemSetting,
  MetricUnits,
  setStoredRadiusUnitsSetting,
  setStoredUnitsSystemSetting,
  StandardUnits,
  Units,
  UnitSystems,
} from "../../utils";
import { SegmentedButtons, TextInput } from "react-native-paper";
import styled from "styled-components";

const unitsSystemButtons = [
  { label: "metric", value: UnitSystems.metric },
  { label: "standard", value: UnitSystems.standard },
];

export type ChatRadiusInputProps = {
  value: string;
  onBlur: Noop;
  onChange: (...event: any[]) => void;
  disabled: boolean;
};

export const ChatRadiusInput: React.FunctionComponent<ChatRadiusInputProps> = ({
  value,
  onBlur,
  onChange,
  disabled,
}) => {
  const [loadedSettings, setLoadedSettings] = useState(false);
  const [unitSystem, setUnitSystem] = useState<UnitSystems>(UnitSystems.metric);
  const [radiusUnits, setRadiusUnits] = useState<Units>(Units.m);
  const [adjustedRadius, setAdjustedRadius] = useState(value);
  const adjustedRadiusRef = useRef<NativeTextInput>(null);

  const unitButtons = useMemo(() => {
    switch (unitSystem) {
      case "metric":
        return MetricUnits.map((u) => {
          return {
            value: u,
            label: u,
          };
        });
      default:
        return StandardUnits.map((u) => {
          return {
            value: u,
            label: u,
          };
        });
    }
  }, [unitSystem]);

  useEffect(() => {
    const effect = async () => {
      const storedUnitsSystem = await getStoredUnitsSystemSetting();
      const storedRadiusUnits = await getStoredRadiusUnitsSetting();
      const storedRadius = await getStoredRadius();
      setUnitSystem(storedUnitsSystem);
      setRadiusUnits(storedRadiusUnits);
      const unitAdjustedRadius = convertToDesiredUnits(
        storedRadius,
        Units.m,
        storedRadiusUnits
      );
      setAdjustedRadius(unitAdjustedRadius.toString());
      setLoadedSettings(true);
    };
    effect().catch((e) => {
      console.error(e);
    });
  }, []);

  useEffect(() => {
    if (!loadedSettings) {
      return;
    }
    const radiusInMeters = convertToMeters(
      Number.parseFloat(adjustedRadius),
      radiusUnits
    );
    onChange(radiusInMeters.toString());
  }, [loadedSettings, adjustedRadius]);

  const onChangeAdjustedRadius = useMemo(() => {
    return (newValue: string) => {
      setAdjustedRadius(newValue);
    };
  }, [setAdjustedRadius]);

  const onRadiusUnitsChange = useMemo(() => {
    return async (value: string) => {
      const newAdjustedRadius = convertToDesiredUnits(
        Number.parseFloat(adjustedRadius),
        radiusUnits,
        Units[value as keyof typeof Units]
      );
      setRadiusUnits(Units[value as keyof typeof Units]);
      setAdjustedRadius(newAdjustedRadius.toString());
      await setStoredRadiusUnitsSetting(Units[value as keyof typeof Units]);
    };
  }, [adjustedRadius, radiusUnits, setRadiusUnits, setAdjustedRadius]);

  const onRadiusUnitsSystemChange = useMemo(() => {
    return async (value: string) => {
      switch (UnitSystems[value as keyof typeof UnitSystems]) {
        case UnitSystems.standard:
          const newAdjustedRadius = convertToDesiredUnits(
            Number.parseFloat(adjustedRadius),
            radiusUnits,
            Units.ft
          );
          setUnitSystem(UnitSystems.standard);
          setRadiusUnits(Units.ft);
          setAdjustedRadius(newAdjustedRadius.toString());
          await setStoredRadiusUnitsSetting(Units.ft);
          break;
        case UnitSystems.metric:
          const newAdjustedRadius2 = convertToDesiredUnits(
            Number.parseFloat(adjustedRadius),
            radiusUnits,
            Units.m
          );
          setUnitSystem(UnitSystems.metric);
          setRadiusUnits(Units.m);
          setAdjustedRadius(newAdjustedRadius2.toString());
          await setStoredRadiusUnitsSetting(Units.m);
          break;
        default:
          throw new Error("unsupported units system");
      }
      await setStoredUnitsSystemSetting(
        UnitSystems[value as keyof typeof UnitSystems]
      );
    };
  }, [adjustedRadius, setUnitSystem, setRadiusUnits, setAdjustedRadius]);
  return (
    <>
      <Styled.SettingRadiusInput
        label={`radius (${radiusUnits})`}
        ref={adjustedRadiusRef}
        onBlur={onBlur}
        onChangeText={onChangeAdjustedRadius}
        value={adjustedRadius}
        inputMode="numeric"
        keyboardType="decimal-pad"
        disabled={disabled || !loadedSettings}
      />
      <Styled.SettingUnitsToggle
        value={radiusUnits}
        onValueChange={onRadiusUnitsChange}
        buttons={unitButtons}
      />
      <Styled.SettingUnitsToggle
        value={unitSystem}
        onValueChange={onRadiusUnitsSystemChange}
        buttons={unitsSystemButtons}
      />
    </>
  );
};

const Styled = {
  SettingRadiusInput: styled(TextInput)``,
  SettingUnitsToggle: styled(SegmentedButtons)`
    margin-top: 10px;
  `,
};
