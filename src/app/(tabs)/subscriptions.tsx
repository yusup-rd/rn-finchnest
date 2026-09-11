import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  return (
    <SafeAreaView className="bg-background flex-1 p-5">
      <Text>Subscriptions</Text>
    </SafeAreaView>
  );
};

export default Subscriptions;
