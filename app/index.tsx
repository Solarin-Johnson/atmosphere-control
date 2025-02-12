import { ThemedView } from "@/components/ThemedView";
import { Meter } from "@/components/ui/Meter";
import Monitor from "@/components/ui/Monitor";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  const [value, setValue] = useState(0);

  const cards = useMemo(
    () => [
      { label: "Humidity", value: 45, unit: "%", faded: true },
      { label: "Temperature", value: value.toFixed(0), unit: "°C" },
    ],
    [value]
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.content}>
        <Meter value={120} maxValue={200} updateValue={setValue} />
        <Monitor cards={cards} />
        {/* <Meter value={50} maxValue={200} /> */}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
    // paddingLeft: 24,
  },
});
