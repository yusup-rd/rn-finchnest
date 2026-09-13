import MonthlyExpenseChart from "@/components/MonthlyExpenseChart";
import SubscriptionCard from "@/components/SubscriptionCard";
import {
  getCurrentMonthExpenses,
  getMonthlyExpenseSeries,
  getSubscriptionsAddedInCurrentMonth,
} from "@/lib/insights";
import { posthog } from "@/lib/posthog";
import { formatCurrency } from "@/lib/utils";
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Insights = () => {
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  const now = dayjs();
  const series = useMemo(
    () => getMonthlyExpenseSeries(subscriptions),
    [subscriptions],
  );
  const currentMonthTotal = useMemo(
    () => getCurrentMonthExpenses(subscriptions),
    [subscriptions],
  );
  const addedThisMonth = useMemo(
    () => getSubscriptionsAddedInCurrentMonth(subscriptions),
    [subscriptions],
  );

  const handleSubscriptionPress = (subscriptionId: string) => {
    const isExpanding = expandedSubscriptionId !== subscriptionId;

    if (isExpanding) {
      posthog?.capture("subscription_expanded", {
        subscription_id: subscriptionId,
        source: "insights",
      });
    }

    setExpandedSubscriptionId(isExpanding ? subscriptionId : null);
  };

  return (
    <SafeAreaView className="bg-background flex-1 p-5">
      <FlatList
        data={addedThisMonth}
        keyExtractor={(item) => item.id}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        contentContainerClassName="pb-20"
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => handleSubscriptionPress(item.id)}
          />
        )}
        ListHeaderComponent={
          <View className="insights-header">
            <Text className="insights-title">Monthly Insights</Text>

            <MonthlyExpenseChart series={series} />

            <View className="insights-expenses-card">
              <Text className="insights-expenses-label">Expenses</Text>
              <View className="insights-expenses-row">
                <Text className="insights-expenses-amount">
                  {formatCurrency(currentMonthTotal)}
                </Text>
                <Text className="insights-expenses-date">
                  {now.format("MMMM")}
                </Text>
              </View>
            </View>

            <Text className="insights-history-title">History</Text>
          </View>
        }
        ListEmptyComponent={
          <Text className="home-empty-state">
            No subscriptions added this month.
          </Text>
        }
      />
    </SafeAreaView>
  );
};

export default Insights;
