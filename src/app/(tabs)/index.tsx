import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import {
  HOME_BALANCE,
  HOME_USER,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { avatar } from "@/constants/images";
import { colors } from "@/constants/theme";
import { posthog } from "@/lib/posthog";
import { formatCurrency } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import { FontAwesome6 as Fa } from "@expo/vector-icons";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { useSubscriptionStore } from "../../lib/subscriptionStore";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const { user } = useUser();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const addSubscription = useSubscriptionStore(
    (state) => state.addSubscription,
  );
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const displayName =
    user?.firstName || user?.fullName || user?.username || HOME_USER.name;
  const photo = user?.imageUrl ? { uri: user.imageUrl } : avatar;

  const handleSubscriptionPress = (subscriptionId: string) => {
    const isExpanding = expandedSubscriptionId !== subscriptionId;

    if (isExpanding) {
      posthog?.capture("subscription_expanded", {
        subscription_id: subscriptionId,
      });
    }

    setExpandedSubscriptionId(isExpanding ? subscriptionId : null);
  };

  return (
    <SafeAreaView className="bg-background flex-1 p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image
                  source={photo}
                  resizeMode="cover"
                  className="home-avatar"
                />
                <Text className="home-user-name">{displayName}</Text>
              </View>
              <Pressable
                onPress={() => setIsCreateModalVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Add subscription"
                hitSlop={8}
              >
                <Fa name="plus" size={32} color={colors.foreground} />
              </Pressable>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                </Text>
              </View>
            </View>

            <View>
              <ListHeading title="Upcoming" />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No upcoming renewals yet.
                  </Text>
                }
              />
            </View>

            <ListHeading title="All Subscriptions" />
          </>
        )}
        data={subscriptions}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => handleSubscriptionPress(item.id)}
          />
        )}
        extraData={expandedSubscriptionId}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View className="h-4" />}
        contentContainerClassName="pb-20"
        ListEmptyComponent={
          <Text className="home-empty-state">No subscriptions yet.</Text>
        }
      />
      <CreateSubscriptionModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onCreate={(subscription) => {
          addSubscription(subscription);
          setIsCreateModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
}
