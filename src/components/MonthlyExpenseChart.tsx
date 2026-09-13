import { colors } from "@/constants/theme";
import { getNiceChartMax, type MonthlyExpensePoint } from "@/lib/insights";
import { formatCurrency } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

type MonthlyExpenseChartProps = {
  series: MonthlyExpensePoint[];
};

const Y_AXIS_WIDTH = 42;
const CHART_HEIGHT = 180;

const MonthlyExpenseChart = ({ series }: MonthlyExpenseChartProps) => {
  const { width: windowWidth } = useWindowDimensions();

  // null = default state, with current month selected
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(
    null,
  );

  const maxAmount = Math.max(...series.map((point) => point.amount), 0);
  const maxValue = getNiceChartMax(maxAmount);

  const chartWidth = Math.max(windowWidth - 104, 220);
  const plotWidth = chartWidth - Y_AXIS_WIDTH;
  const slot = plotWidth / Math.max(series.length, 1);
  const barWidth = Math.min(32, Math.max(18, slot * 0.52));
  const spacing = Math.max(10, slot - barWidth);

  const selectedPoint =
    selectedMonthIndex !== null ? series[selectedMonthIndex] : null;

  const isPreviousMonthSelected =
    selectedPoint !== null && !selectedPoint.isCurrent;

  const data = useMemo(
    () =>
      series.map((point, index) => {
        const isCurrent = point.isCurrent;
        const isSelected = selectedMonthIndex === index;

        const shouldBeNavy =
          isSelected || (isCurrent && !isPreviousMonthSelected);

        return {
          value: point.amount,
          label: point.label,

          frontColor: shouldBeNavy ? colors.primary : colors.accent,

          gradientColor: shouldBeNavy ? "#243056" : "#f5c542",

          labelTextStyle: {
            color: shouldBeNavy ? colors.primary : colors.mutedForeground,
            fontFamily: shouldBeNavy ? "sans-bold" : "sans-medium",
            fontSize: 12,
          },

          onPress: () => {
            if (isCurrent) {
              // Clicking current month restores the default state.
              setSelectedMonthIndex(null);
            } else {
              // Clicking a previous month makes it the navy/selected bar.
              setSelectedMonthIndex(index);
            }
          },
        };
      }),
    [series, selectedMonthIndex, isPreviousMonthSelected],
  );

  const currentMonthAmount =
    series.find((point) => point.isCurrent)?.amount ?? 0;

  return (
    <View className="insights-chart-card">
      <View className="insights-chart-heading">
        <Text className="insights-chart-title">Monthly expenses</Text>
        <Text className="insights-chart-subtitle">
          Last {series.length} months
        </Text>
      </View>

      <BarChart
        data={data}
        width={plotWidth}
        height={CHART_HEIGHT}
        barWidth={barWidth}
        spacing={spacing}
        initialSpacing={8}
        endSpacing={4}
        maxValue={maxValue}
        noOfSections={4}
        roundedTop
        showGradient
        isAnimated={false}
        disableScroll
        hideRules={false}
        rulesType="solid"
        rulesThickness={1}
        rulesColor={colors.border}
        xAxisColor={colors.border}
        yAxisColor="transparent"
        xAxisThickness={1}
        yAxisThickness={0}
        yAxisLabelWidth={Y_AXIS_WIDTH}
        yAxisLabelPrefix="$"
        showFractionalValues={false}
        roundToDigits={0}
        hideOrigin={false}
        backgroundColor="transparent"
        yAxisTextStyle={{
          color: colors.mutedForeground,
          fontFamily: "sans-medium",
          fontSize: 10,
        }}
        xAxisLabelTextStyle={{
          color: colors.mutedForeground,
          fontFamily: "sans-medium",
          fontSize: 12,
        }}
      />

      <View className="insights-legend">
        <View className="insights-legend-item">
          <View className="insights-legend-swatch bg-accent" />
          <Text className="insights-legend-text">Previous months</Text>
        </View>

        <View className="insights-legend-item">
          <View className="insights-legend-swatch bg-primary" />

          <Text className="insights-legend-text">
            {isPreviousMonthSelected
              ? `${selectedPoint.label} · ${formatCurrency(
                  selectedPoint.amount,
                )}`
              : `This month · ${formatCurrency(currentMonthAmount)}`}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default MonthlyExpenseChart;
