import dayjs from "dayjs";
import { icons } from "./icons";

const getNextRenewalDate = (date: string, billing: "Monthly" | "Yearly") => {
  let nextRenewal = dayjs(date);
  const unit = billing === "Yearly" ? "year" : "month";

  while (nextRenewal.isBefore(dayjs())) {
    nextRenewal = nextRenewal.add(1, unit);
  }

  return nextRenewal.toISOString();
};

const getDaysLeft = (date: string) =>
  Math.max(0, dayjs(date).startOf("day").diff(dayjs().startOf("day"), "day"));

export const tabs = [
  {
    name: "index",
    title: "Home",
    icon: "house",
  },
  {
    name: "subscriptions",
    title: "Subscriptions",
    icon: "wallet",
  },
  {
    name: "insights",
    title: "Insights",
    icon: "chart-line",
  },
  {
    name: "settings",
    title: "Settings",
    icon: "gear",
  },
] as const;

export const HOME_USER = {
  name: "Yusup Rejebov",
};

export const HOME_BALANCE = {
  amount: 2489.48,
  nextRenewalDate: getNextRenewalDate("2026-03-18T09:00:00.000Z", "Monthly"),
};

const UPCOMING_SUBSCRIPTION_SEEDS = [
  {
    id: "spotify",
    icon: icons.spotify,
    name: "Spotify",
    price: 5.99,
    currency: "USD",
    renewalDate: getNextRenewalDate("2026-03-13T09:00:00.000Z", "Monthly"),
  },
  {
    id: "notion",
    icon: icons.notion,
    name: "Notion",
    price: 12.0,
    currency: "USD",
    renewalDate: getNextRenewalDate("2026-03-15T09:00:00.000Z", "Monthly"),
  },
  {
    id: "figma",
    icon: icons.figma,
    name: "Figma",
    price: 15.0,
    currency: "USD",
    renewalDate: getNextRenewalDate("2026-03-17T09:00:00.000Z", "Monthly"),
  },
];

export const UPCOMING_SUBSCRIPTIONS: UpcomingSubscription[] =
  UPCOMING_SUBSCRIPTION_SEEDS.filter(({ renewalDate }) =>
    dayjs(renewalDate).isAfter(dayjs()),
  ).map(({ renewalDate, ...subscription }) => ({
    ...subscription,
    daysLeft: getDaysLeft(renewalDate),
  }));

export const HOME_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "adobe-creative-cloud",
    icon: icons.adobe,
    name: "Adobe Creative Cloud",
    plan: "Teams Plan",
    category: "Design",
    paymentMethod: "Visa ending in 8530",
    status: "active",
    startDate: "2025-03-20T10:00:00.000Z",
    price: 77.49,
    currency: "USD",
    billing: "Monthly",
    renewalDate: getNextRenewalDate("2026-03-20T10:00:00.000Z", "Monthly"),
    color: "#f5c542",
  },
  {
    id: "github-pro",
    icon: icons.github,
    name: "GitHub Pro",
    plan: "Developer",
    category: "Developer Tools",
    paymentMethod: "Mastercard ending in 2408",
    status: "active",
    startDate: "2024-11-24T10:00:00.000Z",
    price: 9.99,
    currency: "USD",
    billing: "Monthly",
    renewalDate: getNextRenewalDate("2026-03-24T10:00:00.000Z", "Monthly"),
    color: "#e8def8",
  },
  {
    id: "claude-pro",
    icon: icons.claude,
    name: "Claude Pro",
    plan: "Pro Plan",
    category: "AI Tools",
    paymentMethod: "Amex ending in 1010",
    status: "paused",
    startDate: "2025-06-27T10:00:00.000Z",
    price: 20.0,
    currency: "USD",
    billing: "Monthly",
    renewalDate: getNextRenewalDate("2026-03-27T10:00:00.000Z", "Monthly"),
    color: "#b8d4e3",
  },
  {
    id: "canva-pro",
    icon: icons.canva,
    name: "Canva Pro",
    plan: "Yearly Access",
    category: "Design",
    paymentMethod: "Visa ending in 7784",
    status: "cancelled",
    startDate: "2024-04-02T10:00:00.000Z",
    price: 119.99,
    currency: "USD",
    billing: "Yearly",
    renewalDate: getNextRenewalDate("2026-04-02T10:00:00.000Z", "Yearly"),
    color: "#b8e8d0",
  },
];
