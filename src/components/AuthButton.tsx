import { colors } from "@/constants/theme";
import { clsx } from "clsx";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";

type AuthButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary";
};

const AuthButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
}: AuthButtonProps) => {
  const [pressed, setPressed] = useState(false);
  const reducedMotion = useReducedMotion();
  const isDisabled = disabled || loading;
  const scale = pressed && !reducedMotion && !isDisabled ? 0.97 : 1;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      hitSlop={8}
      pressRetentionOffset={12}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      <Animated.View
        style={{
          transitionProperty: "transform",
          transitionDuration: "120ms",
          transitionTimingFunction: "ease-in",
          transform: [{ scale }],
        }}
      >
        <View
          className={clsx(
            variant === "primary" ? "auth-button" : "auth-secondary-button",
            variant === "primary" && isDisabled && "auth-button-disabled",
          )}
        >
          {loading ? (
            <ActivityIndicator
              color={variant === "primary" ? colors.primary : colors.accent}
            />
          ) : (
            <Text
              className={
                variant === "primary"
                  ? "auth-button-text"
                  : "auth-secondary-button-text"
              }
            >
              {title}
            </Text>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default AuthButton;
