import SubscriptionCard from "@/components/SubscriptionCard";
import { posthog } from "@/lib/posthog";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { useSubscriptionStore } from "../../lib/subscriptionStore";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const [query, setQuery] = useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);

  const filteredSubscriptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return subscriptions;
    }

    return subscriptions.filter((subscription) =>
      [
        subscription.name,
        subscription.plan,
        subscription.category,
        subscription.status,
      ].some((value) => value?.toLowerCase().includes(normalizedQuery)),
    );
  }, [query, subscriptions]);

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
        data={filteredSubscriptions}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => handleSubscriptionPress(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        extraData={expandedSubscriptionId}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className="h-4" />}
        contentContainerClassName="pb-20"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          <View className="subscriptions-header">
            <Text className="subscriptions-title">Subscriptions</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search subscriptions"
              placeholderTextColor="rgba(0, 0, 0, 0.6)"
              className="subscriptions-search"
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
        }
        ListEmptyComponent={
          <Text className="home-empty-state">
            {query.trim()
              ? "No subscriptions match your search."
              : "No subscriptions yet."}
          </Text>
        }
      />
    </SafeAreaView>
  );
};

export default Subscriptions;
