import "@/global.css";
import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { PostHogErrorBoundary, PostHogProvider } from "posthog-react-native";
import { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { posthog } from "@/lib/posthog";

SplashScreen.preventAutoHideAsync();

const getPublishableKey = () => {
  const key = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error("Add your Clerk Publishable Key to the .env file");
  }
  return key;
};

const publishableKey = getPublishableKey();

const RootErrorFallback = () => (
  <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
    <Text>Something went wrong. Please restart the app.</Text>
  </View>
);

const RootNavigator = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();
  const identifiedUserId = useRef<string | null>(null);
  const segments = useSegments();
  const router = useRouter();
  const inAuthGroup = segments[0] === "(auth)";
  const routeMatchesAuthState =
    segments.length > 0 && (isSignedIn ? !inAuthGroup : inAuthGroup);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
      return;
    }

    if (isSignedIn && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [inAuthGroup, isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isLoaded && routeMatchesAuthState) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded, routeMatchesAuthState]);

  useEffect(() => {
    if (!isSignedIn) {
      identifiedUserId.current = null;
      return;
    }

    if (!isUserLoaded || !user || identifiedUserId.current === user.id) {
      return;
    }

    posthog?.identify(user.id, {
      $set: {
        ...(user.primaryEmailAddress?.emailAddress
          ? { email: user.primaryEmailAddress.emailAddress }
          : {}),
        ...(user.firstName ? { first_name: user.firstName } : {}),
        ...(user.lastName ? { last_name: user.lastName } : {}),
      },
    });
    identifiedUserId.current = user.id;
  }, [isSignedIn, isUserLoaded, user]);

  if (!isLoaded) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isSignedIn === true}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={isSignedIn !== true}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "sans-regular": require("@/assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-medium": require("@/assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("@/assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-bold": require("@/assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-light": require("@/assets/fonts/PlusJakartaSans-Light.ttf"),
    "sans-extrabold": require("@/assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const content = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootNavigator />
    </GestureHandlerRootView>
  );

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      {posthog ? (
        <PostHogProvider client={posthog}>
          <PostHogErrorBoundary fallback={RootErrorFallback}>
            {content}
          </PostHogErrorBoundary>
        </PostHogProvider>
      ) : (
        content
      )}
    </ClerkProvider>
  );
}
