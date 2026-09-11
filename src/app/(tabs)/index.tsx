import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="bg-background flex-1 items-center justify-center gap-4">
      <Text className="text-success text-xl font-bold">
        Welcome to Nativewind!
      </Text>
      <Link href="/onboarding" className="bg-primary rounded p-4 text-white">
        Go to Onboarding
      </Link>
      <Link
        href="/(auth)/sign-in"
        className="bg-primary rounded p-4 text-white"
      >
        Go to Sign In
      </Link>
      <Link
        href="/(auth)/sign-up"
        className="bg-primary rounded p-4 text-white"
      >
        Go to Sign Up
      </Link>

      <Link
        href="./subscriptions/spotify"
        className="bg-primary rounded p-4 text-white"
      >
        Spotify Subscription
      </Link>
      <Link
        href={{
          pathname: "./subscriptions/claude-max",
          params: { id: "claude" },
        }}
        className="bg-primary rounded p-4 text-white"
      >
        Claude Max Subscription
      </Link>
    </View>
  );
}
