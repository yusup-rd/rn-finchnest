import { Link } from "expo-router";
import { styled } from "nativewind";
import { Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="bg-background flex-1 p-5">
      <Text className="font-sans-extrabold text-5xl">Home</Text>

      <View className="mt-4 gap-4">
        <Link
          href="/onboarding"
          className="bg-primary font-sans-bold rounded p-4 text-white"
        >
          Go to Onboarding
        </Link>
        <Link
          href="/(auth)/sign-in"
          className="bg-primary font-sans-bold rounded p-4 text-white"
        >
          Go to Sign In
        </Link>
        <Link
          href="/(auth)/sign-up"
          className="bg-primary font-sans-bold rounded p-4 text-white"
        >
          Go to Sign Up
        </Link>
      </View>
    </SafeAreaView>
  );
}
