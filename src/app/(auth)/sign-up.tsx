import AuthBrand from "@/components/AuthBrand";
import AuthButton from "@/components/AuthButton";
import AuthField from "@/components/AuthField";
import AuthScreen from "@/components/AuthScreen";
import AuthVerification from "@/components/AuthVerification";
import { isValidEmail, navigateAfterAuth } from "@/lib/auth";
import { posthog } from "@/lib/posthog";
import { useAuth, useSignIn, useSignUp } from "@clerk/expo";
import * as Haptics from "expo-haptics";
import { Link, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Text, View } from "react-native";

const SignUp = () => {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { signIn } = useSignIn();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const isFetching = fetchStatus === "fetching";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [localErrors, setLocalErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const isVerifying = useMemo(
    () =>
      signUp.status === "missing_requirements" &&
      signUp.unverifiedFields.includes("email_address") &&
      signUp.missingFields.length === 0,
    [signUp.missingFields.length, signUp.status, signUp.unverifiedFields],
  );

  const completeSignUp = async () => {
    setFinalizeError(null);
    setIsFinalizing(true);

    const { error } = await signUp.finalize({
      navigate: ({ session }) => {
        navigateAfterAuth(session, () => router.replace("/(tabs)"));
      },
    });

    if (error) {
      setFinalizeError(
        error.message || "We couldn't finish creating your account.",
      );
      setIsFinalizing(false);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsFinalizing(false);
    posthog?.capture("sign_up_completed");
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSubmit = async () => {
    const nextErrors: typeof localErrors = {};
    const trimmedName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = emailAddress.trim();

    if (!trimmedName) {
      nextErrors.firstName = "Tell us what to call you.";
    }

    if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setLocalErrors(nextErrors);
      return;
    }

    setLocalErrors({});

    const { error } = await signUp.password({
      emailAddress: trimmedEmail,
      password,
      firstName: trimmedName,
      ...(trimmedLastName ? { lastName: trimmedLastName } : {}),
    });

    if (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (signUp.isTransferable) {
      const { error: transferError } = await signIn.create({ transfer: true });
      if (transferError) {
        setLocalErrors({ email: transferError.message });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      router.replace("/(auth)/sign-in");
      return;
    }

    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) {
      return;
    }
  };

  const handleVerify = async () => {
    const { error } = await signUp.verifications.verifyEmailCode({
      code: code.trim(),
    });

    if (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (signUp.status === "complete") {
      await completeSignUp();
      return;
    }

    setLocalErrors({});
  };

  const resetFlow = async () => {
    await signUp.reset();
    setCode("");
    setFinalizeError(null);
    setLocalErrors({});
  };

  if (isSignedIn) {
    return null;
  }

  return (
    <AuthScreen>
      <AuthBrand />
      <Text className="auth-title">Create your nest</Text>
      <Text className="auth-subtitle">
        A few details now, then a clear view of every subscription you keep.
      </Text>

      {signUp.status === "complete" ? (
        <View className="auth-card">
          <View className="auth-form">
            <Text className="auth-helper">
              {finalizeError ||
                "Your account is ready. Finish setting up your nest to continue."}
            </Text>
            <AuthButton
              title="Finish setting up"
              onPress={completeSignUp}
              loading={isFinalizing}
            />
          </View>
        </View>
      ) : isVerifying ? (
        <>
          <AuthVerification
            title="Check your inbox"
            subtitle={`We sent a 6-digit code to ${emailAddress.trim()}. It keeps this nest yours.`}
            code={code}
            onCodeChange={setCode}
            onVerify={handleVerify}
            onResend={() => signUp.verifications.sendEmailCode()}
            onBack={resetFlow}
            error={errors.fields.code?.message}
            loading={isFetching}
          />
        </>
      ) : (
        <View className="auth-card">
          <View className="auth-form">
            <AuthField
              label="First name"
              value={firstName}
              onChangeText={(value) => {
                setFirstName(value);
                setLocalErrors((current) => ({
                  ...current,
                  firstName: undefined,
                }));
              }}
              placeholder="John"
              autoComplete="given-name"
              textContentType="givenName"
              autoCapitalize="words"
              error={localErrors.firstName || errors.fields.firstName?.message}
            />

            <AuthField
              label="Last name"
              value={lastName}
              onChangeText={(value) => {
                setLastName(value);
                setLocalErrors((current) => ({
                  ...current,
                  lastName: undefined,
                }));
              }}
              placeholder="Smith"
              autoComplete="family-name"
              textContentType="familyName"
              autoCapitalize="words"
              error={localErrors.lastName || errors.fields.lastName?.message}
            />

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
              error={localErrors.email || errors.fields.emailAddress?.message}
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
              placeholder="Enter your password"
              autoComplete="new-password"
              textContentType="newPassword"
              secureToggle
              error={localErrors.password || errors.fields.password?.message}
              helper="A longer phrase is easier to remember and harder to guess."
            />

            <AuthField
              label="Confirm password"
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                setLocalErrors((current) => ({
                  ...current,
                  confirmPassword: undefined,
                }));
              }}
              placeholder="Repeat your password"
              autoComplete="new-password"
              textContentType="newPassword"
              secureToggle
              error={localErrors.confirmPassword}
            />

            <AuthButton
              title="Create account"
              onPress={handleSubmit}
              loading={isFetching}
              disabled={!firstName || !emailAddress || !password}
            />
          </View>
        </View>
      )}

      <View nativeID="clerk-captcha" />

      <View className="auth-link-row">
        <Text className="auth-link-copy">Already have a nest?</Text>
        <Link href="/(auth)/sign-in">
          <Text className="auth-link">Sign in</Text>
        </Link>
      </View>
      <Text className="auth-trust">
        We will never share your email. Sign-up stays quiet, local, and on this
        device.
      </Text>
    </AuthScreen>
  );
};

export default SignUp;
