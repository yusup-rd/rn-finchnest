import MonthlyExpenseChart from "@/components/MonthlyExpenseChart";
import SubscriptionCard from "@/components/SubscriptionCard";
import {
  getCurrentMonthExpenses,
  getMonthlyExpenseSeries,
  getSubscriptionsAddedInCurrentMonth,
} from "@/lib/insights";
import { posthog } from "@/lib/posthog";
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import { useFocusEffect } from "expo-router";
import { styled } from "nativewind";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Insights = () => {
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);

  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  /**
   * Stable calendar reference for the current month.
   *
   * This changes only when the calendar crosses into a new month.
   */
  const [calendarBoundary, setCalendarBoundary] = useState(() =>
    dayjs().startOf("month"),
  );

  /**
   * Check the calendar whenever this screen gains focus.
   *
   * This handles cases where the app was in the background or
   * the user navigated away and came back after the month changed.
   */
  useFocusEffect(
    useCallback(() => {
      const currentMonth = dayjs().startOf("month");

      setCalendarBoundary((previousMonth) =>
        previousMonth.isSame(currentMonth, "month")
          ? previousMonth
          : currentMonth,
      );
    }, []),
  );

  /**
   * If the Insights screen stays mounted and remains focused while
   * midnight crosses into a new month, update the calendar boundary
   * automatically.
   */
  useEffect(() => {
    const nextMonth = calendarBoundary.add(1, "month").startOf("month");

    const delay = nextMonth.diff(dayjs());

    const timeout = setTimeout(() => {
      setCalendarBoundary(nextMonth);
    }, delay);

    return () => clearTimeout(timeout);
  }, [calendarBoundary]);

  /**
   * Monthly expense chart.
   */
  const series = useMemo(
    () => getMonthlyExpenseSeries(subscriptions, calendarBoundary),
    [subscriptions, calendarBoundary],
  );

  /**
   * Current month's total expenses.
   */
  const currentMonthTotal = useMemo(
    () => getCurrentMonthExpenses(subscriptions, calendarBoundary),
    [subscriptions, calendarBoundary],
  );

  /**
   * Subscriptions added during the current month.
   */
  const addedThisMonth = useMemo(
    () => getSubscriptionsAddedInCurrentMonth(subscriptions, calendarBoundary),
    [subscriptions, calendarBoundary],
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
        showsVerticalScrollIndicator={false}
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
                  {calendarBoundary.format("MMMM")}
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
