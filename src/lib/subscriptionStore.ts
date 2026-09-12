import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { create } from "zustand";

type SubscriptionStore = {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
};

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  subscriptions: HOME_SUBSCRIPTIONS,
  addSubscription: (subscription) =>
    set((state) => ({
      subscriptions: [subscription, ...state.subscriptions],
    })),
}));
