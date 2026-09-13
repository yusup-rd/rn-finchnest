import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

const ListHeading = ({ title }: ListHeadingProps) => {
  const router = useRouter();
  const handlePress = () => {
    router.navigate("/(tabs)/subscriptions");
  };

  return (
    <View className="list-head">
      <Text className="list-title">{title}</Text>
      <TouchableOpacity className="list-action" onPress={handlePress}>
        <Text className="list-action-text">View All</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ListHeading;
