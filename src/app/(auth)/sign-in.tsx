import AuthBrand from "@/components/AuthBrand";
import AuthButton from "@/components/AuthButton";
import AuthField from "@/components/AuthField";
import AuthScreen from "@/components/AuthScreen";
import AuthVerification from "@/components/AuthVerification";
import {
  isValidEmail,
  navigateAfterAuth
} from "@/lib/auth";
import { useAuth, useSignIn } from "@clerk/expo";
import * as Haptics from "expo-haptics";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

type SignInStep = "credentials" | "trust" | "mfa";
type MfaStrategy = "totp" | "email_code" | "phone_code" | "backup_code";

const SignIn = () => {
  const { signIn, errors, fetchStatus } = useSignIn();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const isFetching = fetchStatus === "fetching";

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<SignInStep>("credentials");
  const [mfaStrategy, setMfaStrategy] = useState<MfaStrategy>("email_code");
  const [localErrors, setLocalErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const completeSignIn = async () => {
    const { error } = await signIn.finalize({
      navigate: ({ session }) => {
        navigateAfterAuth(session, () => router.replace("/(tabs)"));
      },
    });

    if (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const prepareSecondFactor = async () => {
    const factors = signIn.supportedSecondFactors ?? [];
    const totp = factors.find((factor) => factor.strategy === "totp");
    const emailCode = factors.find(
      (factor) => factor.strategy === "email_code",
    );
    const phoneCode = factors.find(
      (factor) => factor.strategy === "phone_code",
    );
    const backupCode = factors.find(
      (factor) => factor.strategy === "backup_code",
    );

    if (totp) {
      setMfaStrategy("totp");
      setStep("mfa");
      return;
    }

    if (emailCode) {
      const { error } = await signIn.mfa.sendEmailCode();
      if (error) {
        return;
      }
      setMfaStrategy("email_code");
      setStep("mfa");
      return;
    }

    if (phoneCode) {
      const { error } = await signIn.mfa.sendPhoneCode();
      if (error) {
        return;
      }
      setMfaStrategy("phone_code");
      setStep("mfa");
      return;
    }

    if (backupCode) {
      setMfaStrategy("backup_code");
      setStep("mfa");
      return;
    }

    setLocalErrors({});
  };

  const continueAfterPassword = async () => {
    if (signIn.status === "complete") {
      await completeSignIn();
      return;
    }

    if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );

      if (!emailCodeFactor) {
        setLocalErrors({});
        return;
      }

      const { error } = await signIn.mfa.sendEmailCode();
      if (error) {
        return;
      }

      setCode("");
      setStep("trust");
      return;
    }

    if (signIn.status === "needs_second_factor") {
      setCode("");
      await prepareSecondFactor();
      return;
    }

    if (signIn.status === "needs_new_password") {
      router.push("/(auth)/forgot-password");
      return;
    }

    setLocalErrors({});
  };

  const handleSubmit = async () => {
    const nextErrors: typeof localErrors = {};
    const trimmedEmail = emailAddress.trim();

    if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (nextErrors.email || nextErrors.password) {
      setLocalErrors(nextErrors);
      return;
    }

    setLocalErrors({});

    const { error } = await signIn.password({
      emailAddress: trimmedEmail,
      password,
    });

    if (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    await continueAfterPassword();
  };

  const handleVerify = async () => {
    const trimmedCode = code.trim();

    if (trimmedCode.length < 6) {
      return;
    }

    const verify =
      step === "trust" || mfaStrategy === "email_code"
        ? () => signIn.mfa.verifyEmailCode({ code: trimmedCode })
        : mfaStrategy === "phone_code"
          ? () => signIn.mfa.verifyPhoneCode({ code: trimmedCode })
          : mfaStrategy === "totp"
            ? () => signIn.mfa.verifyTOTP({ code: trimmedCode })
            : () => signIn.mfa.verifyBackupCode({ code: trimmedCode });

    const { error } = await verify();

    if (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (signIn.status === "complete") {
      await completeSignIn();
      return;
    }

    if (signIn.status === "needs_second_factor") {
      await prepareSecondFactor();
      return;
    }

    setLocalErrors({});
  };

  const resetFlow = async () => {
    await signIn.reset();
    setCode("");
    setStep("credentials");
    setLocalErrors({});
  };

  if (isSignedIn) {
    return null;
  }

  const verificationCopy =
    step === "trust"
      ? {
          title: "Confirm this device",
          subtitle: `We sent a code to ${emailAddress.trim()}. This keeps your nest private on a new phone.`,
        }
      : mfaStrategy === "totp"
        ? {
            title: "Authenticator code",
            subtitle: "Open your authenticator app and enter the 6-digit code.",
          }
        : mfaStrategy === "phone_code"
          ? {
              title: "Check your phone",
              subtitle: "Enter the SMS code to finish signing in.",
            }
          : mfaStrategy === "backup_code"
            ? {
                title: "Backup code",
                subtitle:
                  "Use one of the backup codes you saved when you turned on MFA.",
              }
            : {
                title: "Check your inbox",
                subtitle: `Enter the code we sent to ${emailAddress.trim()}.`,
              };

  return (
    <AuthScreen>
      <AuthBrand />
      <Text className="auth-title">Welcome back</Text>
      <Text className="auth-subtitle">
        Sign in to pick up the conversation about what you pay for, and when.
      </Text>

      {step === "credentials" ? (
        <View className="auth-card">
          <View className="auth-form">
            <AuthField
              label="Email"
              value={emailAddress}
              onChangeText={(value) => {
                setEmailAddress(value);
                setLocalErrors((current) => ({
                  ...current,
                  email: undefined,
                }));
              }}
              placeholder="you@email.com"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              keyboardType="email-address"
              error={localErrors.email || errors.fields.identifier?.message}
            />

            <AuthField
              label="Password"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setLocalErrors((current) => ({
                  ...current,
                  password: undefined,
                }));
              }}
              placeholder="Your password"
              autoComplete="password"
              textContentType="password"
              secureToggle
              error={localErrors.password || errors.fields.password?.message}
            />

            <View className="auth-forgot">
              <Link href="/(auth)/forgot-password">
                <Text className="auth-link">Forgot password?</Text>
              </Link>
            </View>

            <AuthButton
              title="Sign in"
              onPress={handleSubmit}
              loading={isFetching}
              disabled={!emailAddress || !password}
            />
          </View>
        </View>
      ) : (
        <>
          <AuthVerification
            title={verificationCopy.title}
            subtitle={verificationCopy.subtitle}
            code={code}
            onCodeChange={setCode}
            onVerify={handleVerify}
            onResend={
              step === "trust" || mfaStrategy === "email_code"
                ? () => signIn.mfa.sendEmailCode()
                : mfaStrategy === "phone_code"
                  ? () => signIn.mfa.sendPhoneCode()
                  : undefined
            }
            onBack={resetFlow}
            error={errors.fields.code?.message}
            loading={isFetching}
          />
        </>
      )}

      <View className="auth-link-row">
        <Text className="auth-link-copy">New to FinchNest?</Text>
        <Link href="/(auth)/sign-up">
          <Text className="auth-link">Create an account</Text>
        </Link>
      </View>
      <Text className="auth-trust">
        Your session stays on this device. We only use your email to protect
        this nest.
      </Text>
    </AuthScreen>
  );
};

export default SignIn;
