import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ThemedText } from "../ThemedText";
import { ReText } from "react-native-redash";
import { SharedValue } from "react-native-reanimated";
import { useThemeColor } from "@/hooks/useThemeColor";

interface MonitorCardProps {
  label: string;
  value?: string | number | SharedValue<string>;
  animatedValue?: SharedValue<string>;
  unit: string;
  faded?: boolean;
}

export const MonitorCard: React.FC<MonitorCardProps> = memo(
  ({ label, value, unit, faded, animatedValue }) => {
    const color = useThemeColor({}, "text");
    return (
      <View style={styles.container}>
        <ThemedText style={styles.label}>{label}</ThemedText>
        <View style={[styles.valueContainer, faded && styles.faded]}>
          {animatedValue ? (
            <>
              <ReText
                style={[styles.value, { color, marginRight: -4 }]}
                text={animatedValue}
              />
              <ThemedText style={styles.value}>{unit}</ThemedText>
            </>
          ) : (
            <ThemedText style={styles.value}>{`${value}${unit}`}</ThemedText>
          )}
        </View>
      </View>
    );
  }
);

interface MonitorProps {
  children?: React.ReactNode;
}

const Monitor: React.FC<MonitorProps> = memo(({ children }) => {
  return <View style={styles.monitorContainer}>{children}</View>;
});

const styles = StyleSheet.create({
  monitorContainer: {
    justifyContent: "flex-end",
    alignItems: "flex-end",
    flex: 1,
    gap: 6,
    paddingVertical: 42,
    paddingHorizontal: 8,
    // backgroundColor: "red",
  },
  container: {
    padding: 16,
    borderRadius: 12,
    alignItems: "flex-end",
  },
  label: {
    fontSize: 13,
    opacity: 0.6,
    fontWeight: "500",
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  value: {
    fontSize: 48,
    fontFamily: "Inconsolata_700Bold",
    lineHeight: 52,
    letterSpacing: -1.2,
  },
  faded: {
    opacity: 0.6,
  },
});

export default Monitor;
