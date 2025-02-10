import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { View, StyleSheet, ViewStyle, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Line, Rect } from "react-native-svg";
interface MeterProps {
  value: number;
  maxValue: number;
  style?: ViewStyle;
}

export const Meter: React.FC<MeterProps> = ({ value, maxValue, style }) => {
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const meterHeight = height - 70 - insets.top - insets.bottom;
  console.log(insets);

  return (
    <View style={[styles.container, { height: meterHeight }, style]}>
      <Scales value={value} height={meterHeight} />
    </View>
  );
};

interface ScalesProps {
  value?: number;
  height: number;
}

const Scales: React.FC<ScalesProps> = ({ value, height }) => {
  const totalLines = 120; // Ensure equal lines on all devices
  const gap = height / totalLines + 2;
  const strokeColor = useThemeColor({}, "text");
  const tapeWidth = 12;

  return (
    <View style={styles.scale}>
      <Svg width={tapeWidth} height={height} fill="transparent">
        {[...Array(totalLines)].map((_, i) => (
          <Line
            key={i}
            x1={tapeWidth}
            y1={10 + i * gap}
            x2={i % 5 === 0 ? 0 : tapeWidth / 2.5}
            y2={10 + i * gap}
            stroke={strokeColor + "90"}
            strokeWidth={1.5}
          />
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // width: 64,
    // backgroundColor: "red",
    alignSelf: "center",
  },
  scale: {},
});
