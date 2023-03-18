import React, { useEffect, useMemo, useRef, useState } from "react";
import { TextInput as NativeTextInput } from "react-native";
import { Noop } from "react-hook-form";
import {
  convertToDesiredUnits,
  convertToMeters,
  MetricUnits,
  roundTo,
  StandardUnits,
  Units,
  UnitSystems,
} from "../../utils";
import { SegmentedButtons, TextInput } from "react-native-paper";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import {
  selectRadiusInMeters,
  selectUnits,
  selectUnitSystem,
  setRadiusSettings,
} from "./settingsSlice";
import { AppDispatch } from "../../../App";

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
  onBlur,
  onChange,
  disabled,
}) => {
  const savedUnitSystem = useSelector(selectUnitSystem);
  const savedUnits = useSelector(selectUnits);
  const radiusInMeters = useSelector(selectRadiusInMeters);
  const savedAdjustedRadius = convertToDesiredUnits(
    radiusInMeters,
    Units.m,
    savedUnits
  ).toString();
  const dispatch = useDispatch<AppDispatch>();
  const [adjustedRadius, setAdjustedRadius] = useState(savedAdjustedRadius);
  const adjustedRadiusRef = useRef<NativeTextInput>(null);

  const unitButtons = useMemo(() => {
    switch (savedUnitSystem) {
      case "metric":
        return MetricUnits.map((u) => {
          return {
            value: u,
            label: u,
          };
        });
      case "standard":
        return StandardUnits.map((u) => {
          return {
            value: u,
            label: u,
          };
        });
      default:
        throw new Error("unhandled unit system");
    }
  }, [savedUnitSystem]);

  useEffect(() => {
    const radiusInMeters = roundTo(
      convertToMeters(Number.parseFloat(adjustedRadius), savedUnits),
      2
    );
    onChange(radiusInMeters.toString());
  }, [adjustedRadius, savedUnits]);

  const onChangeAdjustedRadius = useMemo(() => {
    return (newValue: string) => {
      setAdjustedRadius(newValue);
    };
  }, [setAdjustedRadius]);

  const onRadiusUnitsChange = useMemo(() => {
    return async (value: string) => {
      const newAdjustedRadius = roundTo(
        convertToDesiredUnits(
          Number.parseFloat(adjustedRadius),
          savedUnits,
          Units[value as keyof typeof Units]
        ),
        2
      );
      dispatch(
        setRadiusSettings({
          unitSystem: savedUnitSystem,
          units: Units[value as keyof typeof Units],
          radiusInMeters: radiusInMeters,
        })
      );
      setAdjustedRadius(newAdjustedRadius.toString());
    };
  }, [adjustedRadius, savedUnits, savedUnitSystem, setAdjustedRadius]);

  const onRadiusUnitsSystemChange = useMemo(() => {
    return async (value: string) => {
      switch (UnitSystems[value as keyof typeof UnitSystems]) {
        case UnitSystems.standard:
          const newAdjustedRadius = roundTo(
            convertToDesiredUnits(
              Number.parseFloat(adjustedRadius),
              savedUnits,
              Units.ft
            ),
            2
          );
          dispatch(
            setRadiusSettings({
              unitSystem: UnitSystems.standard,
              units: Units.ft,
              radiusInMeters: radiusInMeters,
            })
          );
          setAdjustedRadius(newAdjustedRadius.toString());
          break;
        case UnitSystems.metric:
          const newAdjustedRadius2 = roundTo(
            convertToDesiredUnits(
              Number.parseFloat(adjustedRadius),
              savedUnits,
              Units.m
            ),
            2
          );
          dispatch(
            setRadiusSettings({
              unitSystem: UnitSystems.metric,
              units: Units.m,
              radiusInMeters: radiusInMeters,
            })
          );
          setAdjustedRadius(newAdjustedRadius2.toString());
          break;
        default:
          throw new Error("unsupported units system");
      }
    };
  }, [adjustedRadius, savedUnits, savedUnitSystem, setAdjustedRadius]);

  return (
    <>
      <Styled.SettingRadiusInput
        label={`radius (${savedUnits})`}
        ref={adjustedRadiusRef}
        onBlur={onBlur}
        onChangeText={onChangeAdjustedRadius}
        value={adjustedRadius}
        inputMode="numeric"
        keyboardType="decimal-pad"
        disabled={disabled}
      />
      <Styled.SettingUnitsToggle
        value={savedUnits}
        onValueChange={onRadiusUnitsChange}
        buttons={unitButtons}
      />
      <Styled.SettingUnitsToggle
        value={savedUnitSystem}
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
