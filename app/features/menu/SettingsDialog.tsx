import React, { useMemo } from "react";
import { Button, Dialog, Portal } from "react-native-paper";
import { Controller, useForm } from "react-hook-form";
import { ChatRadiusInput } from "./ChatRadiusInput";
import { useDispatch, useSelector } from "react-redux";
import {
  selectRadiusInMeters,
  selectUnits,
  selectUnitSystem,
  setRadiusSettings,
} from "./settingsSlice";
import { AppDispatch } from "../../../App";

export type SettingsDialogProps = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
};

export type SettingsFormData = {
  radius: string;
};

export const SettingsDialog: React.FunctionComponent<SettingsDialogProps> = ({
  visible,
  setVisible,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const hideDialog = useMemo(() => {
    return () => setVisible(false);
  }, [setVisible]);

  const currentUnitSystem = useSelector(selectUnitSystem);
  const currentUnits = useSelector(selectUnits);
  const currentRadiusMeters = useSelector(selectRadiusInMeters);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<SettingsFormData>({
    defaultValues: {
      radius: `${currentRadiusMeters}`,
    },
  });

  const onSubmitRadius = useMemo(() => {
    return async (data: SettingsFormData) => {
      const newRadius = Number.parseFloat(data.radius);
      hideDialog();
      dispatch(
        setRadiusSettings({
          radiusInMeters: newRadius,
          unitSystem: currentUnitSystem,
          units: currentUnits,
        })
      );
    };
  }, [hideDialog, currentUnits, currentUnitSystem]);

  const disableSaveButton = !isValid || isSubmitting || !isDirty;
  return (
    <Portal>
      <Dialog visible={visible}>
        <Dialog.Title>Settings</Dialog.Title>
        <Dialog.Content>
          <Controller
            control={control}
            rules={{
              required: true,
              min: 0.000001,
              max: 4828032.0,
              pattern: /^\d+(\.\d+)?$/,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <ChatRadiusInput
                disabled={isSubmitting}
                onBlur={onBlur}
                onChange={onChange}
                value={value}
              />
            )}
            name="radius"
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={hideDialog}>Cancel</Button>
          <Button
            onPress={handleSubmit(onSubmitRadius)}
            disabled={disableSaveButton}
          >
            Save
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
