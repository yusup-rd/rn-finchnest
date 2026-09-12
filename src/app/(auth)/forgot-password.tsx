import AuthBrand from "@/components/AuthBrand";
import AuthButton from "@/components/AuthButton";
import AuthField from "@/components/AuthField";
import AuthScreen from "@/components/AuthScreen";
import AuthVerification from "@/components/AuthVerification";
import { isValidEmail, navigateAfterAuth } from "@/lib/auth";
import { useSignIn } from "@clerk/expo";
import * as Haptics from "expo-haptics";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

type ResetStep = "email" | "code" | "password";

const ForgotPassword = () => {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const isFetching = fetchStatus === "fetching";

  const [emailAddress, setEmailAddress] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<ResetStep>("email");
  const [localErrors, setLocalErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleSendCode = async () => {
    const trimmedEmail = emailAddress.trim();

    if (!isValidEmail(trimmedEmail)) {
      setLocalErrors({ email: "Enter the email on your FinchNest account." });
      return;
    }

    setLocalErrors({});

    const { error: createError } = await signIn.create({
      identifier: trimmedEmail,
    });
    if (createError) {
      return;
    }

    const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
    if (sendError) {
      setLocalErrors({ email: sendError.message });
      return;
    }

    setStep("code");
  };

  const handleVerifyCode = async () => {
    const { error } = await signIn.resetPasswordEmailCode.verifyCode({
      code: code.trim(),
    });

    if (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setStep("password");
  };

  const handleSubmitPassword = async () => {
    const nextErrors: typeof localErrors = {};

    if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setLocalErrors(nextErrors);
      return;
    }

    setLocalErrors({});

    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password,
      signOutOfOtherSessions: true,
    });

    if (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (signIn.status === "complete") {
      const { error: finalizeError } = await signIn.finalize({
        navigate: ({ session }) => {
          navigateAfterAuth(session, () => router.replace("/(tabs)"));
        },
      });
      if (finalizeError) {
        return;
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    router.replace("/(auth)/sign-in");
  };

  return (
    <AuthScreen>
      <AuthBrand />
      <Text className="auth-title">Reset password</Text>
      <Text className="auth-subtitle">
        We will send a short code, then you can choose a new password for this
        nest.
      </Text>

      {step === "email" ? (
        <View className="auth-card">
          <View className="auth-form">
            <AuthField
              label="Email"
              value={emailAddress}
              onChangeText={(value) => {
                setEmailAddress(value);
                setLocalErrors({});
              }}
              placeholder="you@email.com"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              keyboardType="email-address"
              error={localErrors.email || errors.fields.identifier?.message}
            />
            <AuthButton
              title="Send reset code"
              onPress={handleSendCode}
              loading={isFetching}
              disabled={!emailAddress}
            />
          </View>
        </View>
      ) : null}

      {step === "code" && signIn.status !== "needs_new_password" ? (
        <AuthVerification
          title="Check your inbox"
          subtitle={`Enter the reset code we sent to ${emailAddress.trim()}.`}
          code={code}
          onCodeChange={setCode}
          onVerify={handleVerifyCode}
          onResend={() => signIn.resetPasswordEmailCode.sendCode()}
          onBack={() => {
            setStep("email");
            setCode("");
          }}
          error={errors.fields.code?.message}
          loading={isFetching}
        />
      ) : null}

      {step === "password" || signIn.status === "needs_new_password" ? (
        <View className="auth-card">
          <View className="auth-form">
            <AuthField
              label="New password"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setLocalErrors((current) => ({
                  ...current,
                  password: undefined,
                }));
              }}
              placeholder="Enter a new password"
              autoComplete="new-password"
              textContentType="newPassword"
              secureToggle
              error={localErrors.password || errors.fields.password?.message}
            />
            <AuthField
              label="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repeat your new password"
              autoComplete="new-password"
              textContentType="newPassword"
              secureToggle
              error={localErrors.confirmPassword}
            />
            <AuthButton
              title="Save new password"
              onPress={handleSubmitPassword}
              loading={isFetching}
              disabled={!password}
            />
          </View>
        </View>
      ) : null}

      <View className="auth-link-row">
        <Text className="auth-link-copy">Remembered it?</Text>
        <Link href="/(auth)/sign-in">
          <Text className="auth-link">Back to sign in</Text>
        </Link>
      </View>
    </AuthScreen>
  );
};

export default ForgotPassword;
