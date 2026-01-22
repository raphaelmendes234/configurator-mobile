import { buildSkipTitleMessage } from "@/utils/messageBuilder";
import { sendMessage } from "@/utils/websocket";
import { useEffect } from "react";
import { Dimensions, Pressable, StyleSheet } from "react-native";
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

  const skipTitle = () => {
    const msg = buildSkipTitleMessage("skip");
    sendMessage(msg);
  };

  return (
    <Pressable onPress={skipTitle} style={styles.container}>
      <Animated.Image
        source={require("@/assets/images/oyo-logo.png")}
        style={[imgStyle, styles.image]}
      ></Animated.Image>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    zIndex: 10,
    width: 200,
    height: 200,
  },
});
