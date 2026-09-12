import { colors } from "@/constants/theme";
import { clsx } from "clsx";
import { useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

type AuthFieldProps = TextInputProps & {
  label: string;
  error?: string | null;
  helper?: string;
  secureToggle?: boolean;
};

const AuthField = ({
  label,
  error,
  helper,
  secureToggle = false,
  secureTextEntry,
  className,
  ...inputProps
}: AuthFieldProps) => {
  const [hidden, setHidden] = useState(true);
  const isSecure = secureToggle ? hidden : secureTextEntry;

  return (
    <View className="auth-field">
      <View className="flex-row items-center justify-between">
        <Text className="auth-label">{label}</Text>
        {secureToggle ? (
          <Pressable
            onPress={() => setHidden((current) => !current)}
            hitSlop={8}
            accessibilityRole="button"
          >
            <Text className="auth-toggle">{hidden ? "Show" : "Hide"}</Text>
          </Pressable>
        ) : null}
      </View>
      <TextInput
        {...inputProps}
        className={clsx("auth-input", error && "auth-input-error", className)}
        placeholderTextColor={colors.mutedForeground}
        secureTextEntry={isSecure}
        autoCorrect={false}
        accessibilityLabel={inputProps.accessibilityLabel ?? label}
      />
      {error ? <Text className="auth-error">{error}</Text> : null}
      {!error && helper ? <Text className="auth-helper">{helper}</Text> : null}
    </View>
  );
};

export default AuthField;
