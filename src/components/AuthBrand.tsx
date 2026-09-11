import { icons } from "@/constants/icons";
import { Image, Text, View } from "react-native";

const AuthBrand = () => {
  return (
    <View className="auth-brand-block">
      <View className="auth-logo-wrap">
        <Image
          source={icons.logo}
          className="auth-logo-image"
          resizeMode="cover"
        />
        <View>
          <Text className="auth-wordmark">FinchNest</Text>
          <Text className="auth-wordmark-sub">Subscriptions, clearly</Text>
        </View>
      </View>
    </View>
  );
};

export default AuthBrand;
