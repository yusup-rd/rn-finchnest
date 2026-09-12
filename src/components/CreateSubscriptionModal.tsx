import { icons } from "@/constants/icons";
import { colors } from "@/constants/theme";
import { FontAwesome6 as Fa } from "@expo/vector-icons";
import { clsx } from "clsx";
import dayjs from "dayjs";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type Frequency = "Monthly" | "Yearly";

type CreateSubscriptionModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: Subscription) => void;
};

const categories = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

const categoryColors: Record<(typeof categories)[number], string> = {
  Entertainment: "#f5c542",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f7c8b5",
  Productivity: "#b8e8d0",
  Cloud: "#c7d9f5",
  Music: "#f2c4df",
  Other: "#d8d0c0",
};

const CreateSubscriptionModal = ({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [category, setCategory] =
    useState<(typeof categories)[number]>("Other");
  const [nameError, setNameError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Other");
    setNameError(null);
    setPriceError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const parsedPrice = Number(price);
    const nextNameError = trimmedName ? null : "Enter a subscription name.";
    const nextPriceError =
      Number.isFinite(parsedPrice) && parsedPrice > 0
        ? null
        : "Enter a price greater than zero.";

    setNameError(nextNameError);
    setPriceError(nextPriceError);

    if (nextNameError || nextPriceError) {
      return;
    }

    const startDate = dayjs();
    const renewalDate = startDate.add(
      1,
      frequency === "Yearly" ? "year" : "month",
    );

    onCreate({
      id: `${trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      name: trimmedName,
      price: parsedPrice,
      currency: "USD",
      frequency,
      category,
      status: "active",
      startDate: startDate.toISOString(),
      renewalDate: renewalDate.toISOString(),
      // TODO: FEATURE: Find a huge library of different icons and automatically assign them based on the subscription name
      icon: icons.wallet,
      billing: frequency,
      color: categoryColors[category],
    });

    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="modal-overlay">
        <KeyboardAvoidingView
          className="modal-container"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View className="modal-header">
            <Text className="modal-title">New Subscription</Text>
            <Pressable
              onPress={handleClose}
              className="modal-close"
              accessibilityRole="button"
              accessibilityLabel="Close new subscription form"
            >
              <Fa name="xmark" size={24} color={colors.foreground} />
            </Pressable>
          </View>

          <ScrollView
            className="modal-body"
            contentContainerClassName="gap-5"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="field">
              <Text className="label">Name</Text>
              <TextInput
                value={name}
                onChangeText={(value) => {
                  setName(value);
                  setNameError(null);
                }}
                className={clsx("input", nameError && "input-error")}
                placeholder="e.g. Netflix"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="words"
                returnKeyType="next"
              />
              {nameError ? <Text className="error">{nameError}</Text> : null}
            </View>

            <View className="field">
              <Text className="label">Price</Text>
              <TextInput
                value={price}
                onChangeText={(value) => {
                  setPrice(value);
                  setPriceError(null);
                }}
                className={clsx("input", priceError && "input-error")}
                placeholder="0.00"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="decimal-pad"
                inputMode="decimal"
              />
              {priceError ? <Text className="error">{priceError}</Text> : null}
            </View>

            <View className="field">
              <Text className="label">Frequency</Text>
              <View className="picker-row">
                {(["Monthly", "Yearly"] as Frequency[]).map((option) => {
                  const active = frequency === option;

                  return (
                    <Pressable
                      key={option}
                      onPress={() => setFrequency(option)}
                      className={clsx(
                        "picker-option",
                        active && "picker-option-active",
                      )}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                    >
                      <Text
                        className={clsx(
                          "picker-option-text",
                          active && "picker-option-text-active",
                        )}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="field">
              <Text className="label">Category</Text>
              <View className="category-scroll">
                {categories.map((option) => {
                  const active = category === option;

                  return (
                    <Pressable
                      key={option}
                      onPress={() => setCategory(option)}
                      className={clsx(
                        "category-chip",
                        active && "category-chip-active",
                      )}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                    >
                      <Text
                        className={clsx(
                          "category-chip-text",
                          active && "category-chip-text-active",
                        )}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Pressable
              onPress={handleSubmit}
              className={clsx(
                "button",
                (!name.trim() ||
                  !Number.isFinite(Number(price)) ||
                  Number(price) <= 0) &&
                  "button-disabled",
              )}
              accessibilityRole="button"
              accessibilityLabel="Create subscription"
            >
              <Text className="button-text">Create Subscription</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default CreateSubscriptionModal;
