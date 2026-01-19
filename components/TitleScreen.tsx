import { useEffect } from "react";
import { Dimensions, StyleSheet } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

export function TitleScreen() {
  const width = Dimensions.get("window").width;
  const height = Dimensions.get("window").height;

  const imgOpacity = useSharedValue(1);
  const imgScale = useSharedValue(1);

  useEffect(() => {
    imgOpacity.value = withRepeat(withTiming(0, { duration: 2000 }), -1, true);
    imgScale.value = withRepeat(withTiming(0.5, { duration: 2000 }), -1, true);
  }, []);

  const imgStyle = useAnimatedStyle(() => ({
    opacity: imgOpacity.value,
    transform: [{ scale: imgScale.value }],
  }));

  return (
    <Animated.Image
      source={require("@/assets/images/icon.png")}
      style={[imgStyle, styles.image]}
    ></Animated.Image>
  );
}

const styles = StyleSheet.create({
  container: {},
  image: {
    width: 200,
    height: 200,
  },
});
