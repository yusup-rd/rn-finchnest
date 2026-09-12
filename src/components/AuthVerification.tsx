import AuthButton from "@/components/AuthButton";
import AuthField from "@/components/AuthField";
import { Pressable, Text, View } from "react-native";

type AuthVerificationProps = {
  title: string;
  subtitle: string;
  verificationMethod?: "numeric" | "backup";
  factorOptions?: readonly { value: string; label: string }[];
  selectedFactor?: string;
  onFactorChange?: (value: string) => void;
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
  verificationMethod = "numeric",
  factorOptions,
  selectedFactor,
  onFactorChange,
  code,
  onCodeChange,
  onVerify,
  onResend,
  onBack,
  error,
  loading = false,
  verifyLabel = "Verify",
}: AuthVerificationProps) => {
  const isBackupCode = verificationMethod === "backup";

  return (
    <View className="auth-card">
      <View className="auth-form">
        <Text className="auth-title">{title}</Text>
        <Text className="helper">{subtitle}</Text>
        {factorOptions && onFactorChange ? (
          <View className="auth-factor-list">
            {factorOptions.map((factor) => (
              <Pressable
                key={factor.value}
                onPress={() => onFactorChange(factor.value)}
                className={`auth-factor-option ${selectedFactor === factor.value ? "auth-factor-option-selected" : ""}`}
              >
                <Text className="auth-factor-option-text">{factor.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <AuthField
          label="Verification code"
          value={code}
          onChangeText={onCodeChange}
          placeholder={isBackupCode ? "Enter your backup code" : "123456"}
          keyboardType={isBackupCode ? "default" : "number-pad"}
          inputMode={isBackupCode ? "text" : "numeric"}
          maxLength={isBackupCode ? undefined : 6}
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          error={error}
          className="auth-code-input"
        />
        <AuthButton
          title={verifyLabel}
          onPress={onVerify}
          loading={loading}
          disabled={isBackupCode ? !code.trim() : code.trim().length < 6}
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
