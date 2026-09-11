import AuthButton from "@/components/AuthButton";
import { avatar } from "@/constants/images";
import { useClerk, useUser } from "@clerk/expo";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import { Image, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const displayName =
    user?.firstName || user?.fullName || user?.username || "Your nest";
  const email = user?.primaryEmailAddress?.emailAddress;
  const photo = user?.imageUrl ? { uri: user.imageUrl } : avatar;

  const handleSignOut = async () => {
    await signOut();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/(auth)/sign-in");
  };

  return (
    <SafeAreaView className="settings-screen">
      <Text className="settings-title">Settings</Text>
      <View className="settings-card">
        <View className="settings-identity">
          <Image source={photo} className="settings-avatar" />
          <View className="min-w-0 flex-1">
            <Text className="settings-name" numberOfLines={1}>
              {displayName}
            </Text>
            {email ? (
              <Text className="settings-email" numberOfLines={1}>
                {email}
              </Text>
            ) : null}
          </View>
        </View>
        <AuthButton title="Sign out" onPress={handleSignOut} />
      </View>
    </SafeAreaView>
  );
};

export default Settings;
