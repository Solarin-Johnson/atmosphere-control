import { ThemedView } from "@/components/ThemedView";
import { Meter } from "@/components/ui/Meter";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.content}>
        <Meter value={120} maxValue={200} />
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
