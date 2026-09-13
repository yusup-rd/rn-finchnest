import dayjs, { type Dayjs } from "dayjs";

export const MONTHS_IN_CHART = 6;

export type MonthlyExpensePoint = {
  month: Dayjs;
  label: string;
  amount: number;
  isCurrent: boolean;
};

const getBillingInterval = (subscription: Subscription): "month" | "year" => {
  const raw = (
    subscription.billing ||
    subscription.frequency ||
    "Monthly"
  ).toLowerCase();
  return raw.startsWith("year") ? "year" : "month";
};

export const getChargeForMonth = (
  subscription: Subscription,
  month: Dayjs,
  now = dayjs(),
): number => {
  if (!Number.isFinite(subscription.price) || subscription.price <= 0) {
    return 0;
  }

  const start = subscription.startDate ? dayjs(subscription.startDate) : null;
  if (!start?.isValid()) {
    return 0;
  }

  const monthStart = month.startOf("month");
  const monthEnd = month.endOf("month");

  if (start.isAfter(monthEnd)) {
    return 0;
  }

  if (
    subscription.status === "cancelled" &&
    !monthStart.isBefore(now.startOf("month"))
  ) {
    return 0;
  }

  if (getBillingInterval(subscription) === "year") {
    if (
      start.month() !== monthStart.month() ||
      monthStart.year() < start.year()
    ) {
      return 0;
    }

    return subscription.price;
  }

  return subscription.price;
};

export const getMonthlyExpenseSeries = (
  subscriptions: Subscription[],
  now: Dayjs = dayjs(),
  monthCount = MONTHS_IN_CHART,
): MonthlyExpensePoint[] =>
  Array.from({ length: monthCount }, (_, index) => {
    const month = now
      .startOf("month")
      .subtract(monthCount - 1 - index, "month");

    const amount = subscriptions.reduce(
      (sum, subscription) => sum + getChargeForMonth(subscription, month, now),
      0,
    );

    return {
      month,
      label: month.format("MMM"),
      amount,
      isCurrent: month.isSame(now, "month"),
    };
  });

export const getCurrentMonthExpenses = (
  subscriptions: Subscription[],
  now: Dayjs = dayjs(),
): number =>
  subscriptions.reduce(
    (sum, subscription) => sum + getChargeForMonth(subscription, now, now),
    0,
  );

export const getSubscriptionsAddedInCurrentMonth = (
  subscriptions: Subscription[],
  now: Dayjs = dayjs(),
): Subscription[] =>
  subscriptions
    .filter((subscription) => {
      if (!subscription.startDate) {
        return false;
      }

      const start = dayjs(subscription.startDate);

      return start.isValid() && start.isSame(now, "month");
    })
    .sort(
      (left, right) =>
        dayjs(left.startDate).valueOf() - dayjs(right.startDate).valueOf(),
    );

export const getNiceChartMax = (value: number): number => {
  if (value <= 0) {
    return 100;
  }

  const padded = value * 1.2;
  const magnitude = 10 ** Math.floor(Math.log10(padded));
  return Math.ceil(padded / magnitude) * magnitude;
};
