import AuthButton from "@/components/AuthButton";
import AuthField from "@/components/AuthField";
import { Pressable, Text, View } from "react-native";

type AuthVerificationProps = {
  title: string;
  subtitle: string;
  code: string;
  onCodeChange: (value: string) => void;
  onVerify: () => void;
  onResend?: () => void;
  onBack?: () => void;
  error?: string | null;
  loading?: boolean;
  verifyLabel?: string;
};

const AuthVerification = ({
  title,
  subtitle,
  code,
  onCodeChange,
  onVerify,
  onResend,
  onBack,
  error,
  loading = false,
  verifyLabel = "Verify",
}: AuthVerificationProps) => {
  return (
    <View className="auth-card">
      <View className="auth-form">
        <Text className="auth-title">{title}</Text>
        <Text className="auth-helper">{subtitle}</Text>
        <AuthField
          label="Verification code"
          value={code}
          onChangeText={onCodeChange}
          placeholder="123456"
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={6}
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          error={error}
          className="auth-code-input"
        />
        <AuthButton
          title={verifyLabel}
          onPress={onVerify}
          loading={loading}
          disabled={code.trim().length < 6}
        />
        {onResend ? (
          <AuthButton
            title="Send a new code"
            onPress={onResend}
            disabled={loading}
            variant="secondary"
          />
        ) : null}
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={8} className="items-center py-2">
            <Text className="auth-link">Use a different email</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

export default AuthVerification;
