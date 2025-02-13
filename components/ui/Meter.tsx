import { useThemeColor } from "@/hooks/useThemeColor";
import React, { Fragment, memo } from "react";
import {
  View,
  StyleSheet,
  ViewStyle,
  useWindowDimensions,
  Platform,
  Text,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, G, Line, Path } from "react-native-svg";
import Monitor, { MonitorCard } from "./Monitor";

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedText = Animated.createAnimatedComponent(Text);

const calculatePercentage = (value: number, maxValue: number) => {
  return Math.min(Math.max((value / maxValue) * 100, 0), 96) / 100;
};

interface MeterProps {
  value: number;
  maxValue: number;
  style?: ViewStyle;
  updateValue?: any;
}

export const Meter: React.FC<MeterProps> = ({ value, maxValue, style }) => {
  const currentValue = useSharedValue(value);
  const percentage = useSharedValue(calculatePercentage(value, maxValue));
  const depth = useSharedValue(0);
  const pressed = useSharedValue(false);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const meterHeight = height - 70 - insets.top - insets.bottom;
  const currentValueString = useSharedValue(`${value}`);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      depth.value = withSpring(8, { duration: 240 }); // Press-in effect
      pressed.value = true;
    })
    .onUpdate(({ y }) => {
      const newValue = Math.round(
        Math.min(Math.max(currentValue.value + 5 - y / 10, 0), maxValue)
      );

      currentValue.value = newValue;
      currentValueString.value = `${newValue}`;

      percentage.value =
        Math.min(Math.max((newValue / maxValue) * 100, 0), 96) / 100;
    })
    .onFinalize(() => {
      if (pressed.value) {
        depth.value = withSpring(0, { duration: 240 });
        pressed.value = false;
      }
    });

  return (
    <>
      <View style={[styles.container, { height: meterHeight }, style]}>
        <Scales height={meterHeight} percent={percentage} pressed={depth} />
        <GestureDetector gesture={panGesture}>
          <Handle pressed={pressed} percent={percentage} height={meterHeight} />
        </GestureDetector>
      </View>
      <Monitor>
        <MonitorCard label="Humidity" value={45} unit="%" faded />
        <MonitorCard
          label="Temperature"
          animatedValue={currentValueString}
          unit="°C"
        />
      </Monitor>
    </>
  );
};

interface ScalesProps {
  value?: number;
  height: number;
  percent?: any;
  pressed: any;
}

const Scales: React.FC<ScalesProps> = memo(({ percent, height, pressed }) => {
  const totalLines = 100; // Ensure equal lines on all devices
  const gap = height / totalLines;
  const strokeColor = useThemeColor({}, "text");
  const lowColor = useThemeColor({}, "low");
  const highColor = useThemeColor({}, "high");
  const tapeWidth = 54;
  const range = 8;

  const current = useDerivedValue(() => {
    return totalLines - Math.floor(totalLines * percent.value);
  });
  const startRange = useDerivedValue(() => {
    return current.value - range;
  });
  const endRange = useDerivedValue(() => {
    return startRange.value + range;
  });

  const colorStops = useDerivedValue(() => {
    return interpolateColor(percent.value, [0, 1], [highColor, lowColor]);
  });

  const calcFilled = useDerivedValue(() => {
    return endRange.value - range + 5;
  });

  const normStartRange = useDerivedValue(() => {
    return startRange.value - range / 4;
  });

  const normendRange = useDerivedValue(() => {
    return endRange.value + range / 4;
  });

  const renderLines = (isSecondSet: boolean) => {
    return [...Array(totalLines)].map((_, i) => {
      const x2 = isSecondSet
        ? tapeWidth - 2
        : i % 5 === 0
        ? tapeWidth - tapeWidth / 4
        : tapeWidth - tapeWidth / 7;

      const isInRange = useDerivedValue(() => {
        return i >= normStartRange.value && i <= normendRange.value;
      });

      const filled = useDerivedValue(() => {
        return percent.value <= 0 ? false : i > calcFilled.value;
      });

      // Derived value for curveFactor
      const curveFactor = useDerivedValue(() => {
        if (isInRange.value) {
          const normalized =
            (i - normStartRange.value) /
            (endRange.value - startRange.value - range / 4);
          return -(1 - Math.cos(normalized * Math.PI)) * pressed.value;
        }
        return 0;
      });

      const strokeColorAnimated = useDerivedValue(() => {
        return isSecondSet
          ? !filled.value
            ? strokeColor
            : colorStops.value
          : strokeColor;
      });
      const opacity = useDerivedValue(() => (filled.value ? 1 : 0.3));

      const animatedProps = useAnimatedProps(() => {
        "worklet";

        return {
          transform: [{ translateX: curveFactor.value }],
          stroke: strokeColorAnimated.value,
          ...(isSecondSet && { opacity: opacity.value }),
        };
      });

      return (
        <AnimatedLine
          key={i}
          x1={tapeWidth - (isSecondSet ? 2 : 0)}
          y1={(isSecondSet ? 0 : 10) + i * gap}
          x2={x2}
          y2={(isSecondSet ? 0 : 10) + i * gap}
          strokeWidth={isSecondSet ? 2.8 : 1.5}
          strokeLinecap="round"
          animatedProps={animatedProps}
        />
      );
    });
  };

  return (
    <View style={styles.scale}>
      <AnimatedSvg width={tapeWidth} height={height} fill="transparent">
        {renderLines(false)}
      </AnimatedSvg>
      <AnimatedSvg
        width={tapeWidth}
        height={height - 10}
        style={{
          marginTop: 10,
          marginLeft: -tapeWidth + 16,
        }}
      >
        {renderLines(true)}
      </AnimatedSvg>
    </View>
  );
});

const Handle: React.FC<{
  pressed: any;
  percent?: any;
  height: number;
  setValue?: Function;
}> = memo(({ pressed, percent, height }) => {
  const strokeColor = useThemeColor({}, "text");
  const isWeb = Platform.OS === "web";
  const range = isWeb ? 13 : 15.5;

  const animatedProps = useAnimatedProps(() => {
    "worklet";
    const size = withSpring(pressed.value ? 8 : 4, { duration: 200 });
    return {
      opacity: pressed.value ? 1 : 0,
      r: size,
      origin: size,
    };
  });

  const handleAnimatedProps = useAnimatedProps(() => {
    "worklet";
    return {
      opacity: !pressed.value ? 1 : 0,
    };
  });

  const animatedStyle = useAnimatedStyle(() => {
    const current = height - Math.floor(height * percent.value);

    return {
      height: 80,
      marginTop: current - range * 2 - 25,
    };
  });

  const Wrapper = isWeb ? Animated.View : Fragment;

  return (
    <Wrapper
      {...(isWeb && {
        style: animatedStyle,
      })}
    >
      <AnimatedSvg
        width={80}
        fill="transparent"
        style={!isWeb && animatedStyle}
      >
        <G y={30} x={4}>
          <AnimatedCircle
            cx={20}
            cy={10}
            fill={strokeColor}
            stroke={strokeColor}
            strokeWidth={1.5}
            animatedProps={animatedProps}
          />

          <AnimatedG
            scale={0.7}
            animatedProps={handleAnimatedProps}
            translateX={13}
          >
            <Path
              d="M9.1583 1.31208C9.5518 0.698676 10.4482 0.698676 10.8417 1.31208L17.6724 11.9601C18.0993 12.6256 17.6214 13.5 16.8307 13.5H3.16932C2.37859 13.5 1.90067 12.6256 2.32762 11.9601L9.1583 1.31208Z"
              fill={strokeColor}
            />
            <Path
              d="M10.8417 27.488C10.4482 28.1014 9.5518 28.1014 9.1583 27.488L2.32762 16.84C1.90067 16.1744 2.37859 15.3 3.16932 15.3L16.8307 15.3C17.6214 15.3 18.0993 16.1744 17.6724 16.84L10.8417 27.488Z"
              fill={strokeColor}
            />
          </AnimatedG>
        </G>
      </AnimatedSvg>
    </Wrapper>
  );
});

const styles = StyleSheet.create({
  container: {
    width: 120,
    flexDirection: "row",
    alignSelf: "center",
  },
  scale: {
    flexDirection: "row",
    gap: 2,
  },
});
