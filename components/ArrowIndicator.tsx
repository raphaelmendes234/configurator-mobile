import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

type ArrowProps = {
  index: number;
  progress: SharedValue<number>;
  color: string;
  size: number;
};

const SingleArrow = ({ index, progress, color, size }: ArrowProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    // Ici, on veut que la flèche s'allume dès que progress dépasse son index
    // On utilise Extrapolation.CLAMP pour qu'elle reste à 1 une fois allumée
    const opacity = interpolate(
      progress.value,
      [index - 0.5, index],
      [0, 1], // Passe de 10% à 100% d'opacité
      Extrapolation.CLAMP,
    );

    return {
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: size,
          height: size,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <Path
          d="M12.175 9H0V7H12.175L6.575 1.4L8 0L16 8L8 16L6.575 14.6L12.175 9Z"
          fill="#D9F203"
        />
      </Svg>
    </Animated.View>
  );
};

type Props = {
  count?: number;
  color?: string;
  size?: number;
  duration?: number;
};

export function ArrowIndicator({
  count = 6,
  color = "#daf203",
  size = 20,
  duration = 1000,
}: Props) {
  const progress = useSharedValue(-1);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(count, {
        duration: duration,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true,
    );
  }, [count, duration]);

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <SingleArrow
          key={index}
          index={index}
          progress={progress}
          color={color}
          size={size}
        />
      ))}
    </View>
  );
}
