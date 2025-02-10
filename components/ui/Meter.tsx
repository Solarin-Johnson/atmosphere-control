import { useThemeColor } from "@/hooks/useThemeColor";
import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnUI,
  useAnimatedProps,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";
interface MeterProps {
  value: number;
  maxValue: number;
  style?: ViewStyle;
}

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const Meter: React.FC<MeterProps> = ({ value, maxValue, style }) => {
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);
  const depth = useSharedValue(0);
  const pressed = useSharedValue(false);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const meterHeight = height - 70 - insets.top - insets.bottom;
  console.log(insets);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      depth.value = withTiming(10); // Press-in effect
      pressed.value = true;
    })
    .onFinalize(() => {
      depth.value = withTiming(0); // Ensures reset on release
      pressed.value = false;
    });

  console.log(pressed.value);

  return (
    <GestureDetector gesture={panGesture}>
      <View style={[styles.container, { height: meterHeight }, style]}>
        <Scales
          value={value}
          height={meterHeight}
          percent={percentage / 100}
          pressed={depth}
        />
        <Handle
          pressed={pressed}
          percent={percentage / 109}
          height={meterHeight}
        />
      </View>
    </GestureDetector>
  );
};

interface ScalesProps {
  value?: number;
  height: number;
  percent: number;
  pressed: any;
}

const Scales: React.FC<ScalesProps> = ({ percent, height, pressed }) => {
  const step = useSharedValue(0);
  const totalLines = 200; // Ensure equal lines on all devices
  const gap = height / totalLines;
  const strokeColor = useThemeColor({}, "text");
  const tapeWidth = 54;

  const range = 14;
  const current = Math.floor(totalLines * percent + step.value);
  const startRange = current - range;
  const endRange = startRange + range;

  return (
    <View style={styles.scale}>
      <AnimatedSvg width={tapeWidth} height={height} fill="transparent">
        {[...Array(totalLines)].map((_, i) => {
          const x2 =
            i % 5 === 0
              ? tapeWidth - tapeWidth / 4.5
              : tapeWidth - tapeWidth / 7;

          const animatedProps = useAnimatedProps(() => {
            "worklet";
            let curveFactor = 0;
            if (startRange - 5 <= i && i < endRange + 5) {
              const normalized =
                (i - (startRange - 5)) / (endRange - startRange - 3);
              curveFactor =
                (1 - Math.cos(normalized * Math.PI)) * pressed.value;
            }
            return { transform: [{ translateX: -curveFactor }] };
          });

          return (
            <AnimatedLine
              key={i}
              x1={tapeWidth}
              y1={10 + i * gap}
              x2={x2}
              animatedProps={animatedProps}
              y2={10 + i * gap}
              stroke={strokeColor + "90"}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          );
        })}
      </AnimatedSvg>
      <AnimatedSvg
        width={tapeWidth}
        height={height - 10}
        fill="red"
        style={{ marginTop: 10, marginLeft: -tapeWidth + 16 }}
      >
        {[...Array(totalLines)].map((_, i) => {
          const x2 = tapeWidth - 2;

          const animatedProps = useAnimatedProps(() => {
            "worklet";
            let curveFactor = 0;
            if (startRange - 5 <= i && i < endRange + 5) {
              const normalized =
                (i - (startRange - 5)) / (endRange - startRange - 3);
              curveFactor =
                (1 - Math.cos(normalized * Math.PI)) * pressed.value;
            }
            return { transform: [{ translateX: -curveFactor }] };
          });

          return (
            <AnimatedLine
              key={i}
              x1={tapeWidth - 2}
              y1={i * gap}
              x2={x2}
              animatedProps={animatedProps} // Apply animatedProps
              y2={i * gap}
              stroke={
                i > endRange - range + 5 ? strokeColor : strokeColor + "50"
              }
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          );
        })}
      </AnimatedSvg>
    </View>
  );
};

const Handle: React.FC<{ pressed: any; percent: number; height: number }> = ({
  pressed,
  percent,
  height,
}) => {
  const strokeColor = useThemeColor({}, "text");
  const current = Math.floor(height * percent);

  const animatedProps = useAnimatedProps(() => {
    "worklet";
    return {
      transform: [{ scale: pressed.value ? withTiming(1.2) : withTiming(1) }],
    };
  });

  return (
    <AnimatedSvg
      width={50}
      height={50}
      fill="transparent"
      style={{ marginTop: current }}
    >
      <AnimatedCircle
        cx={10}
        cy={10}
        r={8}
        fill={strokeColor}
        stroke={strokeColor}
        strokeWidth={1.5}
        animatedProps={animatedProps}
      />
    </AnimatedSvg>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    width: 120,
    gap: 12,
    flexDirection: "row",
    // backgroundColor: "red",
    alignSelf: "center",
  },
  scale: {
    flexDirection: "row",
    // flex: 1,
  },
});
