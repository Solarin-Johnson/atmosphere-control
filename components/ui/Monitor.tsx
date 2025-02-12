import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ThemedText } from "../ThemedText";

interface MonitorCardProps {
  label: string;
  value: string | number;
  unit: string;
  faded?: boolean;
}

export const MonitorCard: React.FC<MonitorCardProps> = ({
  label,
  value,
  unit,
  faded,
}) => {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <View style={[styles.valueContainer, faded && styles.faded]}>
        <ThemedText style={styles.value}>{`${value}${unit}`}</ThemedText>
      </View>
    </View>
  );
};

interface MonitorProps {
  cards: MonitorCardProps[];
}

const Monitor: React.FC<MonitorProps> = ({ cards }) => {
  return (
    <View style={styles.monitorContainer}>
      {cards.map((card, index) => (
        <MonitorCard key={index} {...card} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  monitorContainer: {
    justifyContent: "flex-end",
    alignItems: "flex-end",
    flex: 1,
    gap: 6,
    paddingVertical: 42,
    paddingHorizontal: 8,
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
