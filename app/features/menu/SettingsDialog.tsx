import React, { useMemo } from "react";
import { Button, Dialog, Portal, TextInput } from "react-native-paper";
import { Controller, useForm } from "react-hook-form";
import styled from "styled-components";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type SettingsDialogProps = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  currentRadius: number;
  setRadius: (radius: number) => void;
};

type FormData = {
  radius: string;
};

export const SettingsDialog: React.FunctionComponent<SettingsDialogProps> = ({
  visible,
  setVisible,
  currentRadius,
  setRadius,
}) => {
  const hideDialog = useMemo(() => {
    return () => setVisible(false);
  }, [setVisible]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<FormData>({
    defaultValues: {
      radius: `${currentRadius}`,
    },
  });

  const onSubmitRadius = useMemo(() => {
    return async (data: FormData) => {
      setRadius(Number.parseFloat(data.radius));
      hideDialog();
      await AsyncStorage.setItem("@Settings:radius", data.radius);
    };
  }, [currentRadius, setRadius, hideDialog]);

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
              <Styled.SettingRadiusInput
                label="radius"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                inputMode="numeric"
                keyboardType="decimal-pad"
                disabled={isSubmitting}
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

const Styled = {
  SettingRadiusInput: styled(TextInput)``,
};
