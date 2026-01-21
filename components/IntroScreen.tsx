import { SoftHaptic, SuccessHaptic } from "@/utils/haptics";
import { buildSkipIntroMessage } from "@/utils/messageBuilder";
import { sendMessage } from "@/utils/websocket";
import { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { ArrowIndicator } from "./ArrowIndicator";

export function IntroScreen() {
  // Constantes de dimensions
  const width = Dimensions.get("window").width;
  const height = Dimensions.get("window").height;
  const circleSize = 100;
  const safeArea = width * 0.5;

  // Positions fixes
  const startX = 100;
  const startY = height - 300;
  const endX = width - 100;
  const endY = startY;

  // Shared Values
  const absX = useSharedValue(startX);
  const absY = useSharedValue(startY);
  const rotation = useSharedValue(0);
  const btnScale = useSharedValue(100);
  const btnTextScale = useSharedValue(150);
  const succesOpacity = useSharedValue(0);
  const arrowsOpacity = useSharedValue(1);
  const hasSwiped = useSharedValue(false);

  // Fonction pour démarrer la rotation infinie
  const startRotation = () => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }), // 8000ms pour un tour complet, ajuste selon tes goûts
      -1, // -1 signifie infini
    );
  };

  // Lancer la rotation au montage du composant
  useEffect(() => {
    startRotation();
  }, []);

  const handleThrowRelease = () => {
    SuccessHaptic();

    // 💡 Envoi du message WebSocket
    const msg = buildSkipIntroMessage("skip");
    sendMessage(msg);
  };

  // --- Gesture Handler ---
  const drag = Gesture.Pan()
    .onBegin((event) => {
      if (hasSwiped.value) return;

      cancelAnimation(rotation);
      btnScale.value = withTiming(125, { duration: 200 });
      btnTextScale.value = withTiming(50, { duration: 200 });
      arrowsOpacity.value = withTiming(0, { duration: 300 });

      absX.value = event.absoluteX;
      absY.value = event.absoluteY;
      runOnJS(SoftHaptic)();
    })
    .onChange((event) => {
      if (hasSwiped.value) return;

      absX.value = event.absoluteX;
      absY.value = event.absoluteY;
    })
    .onFinalize(() => {
      if (hasSwiped.value) return;

      absY.value = withTiming(endY, {
        duration: 500,
        easing: Easing.out(Easing.exp),
      });

      if (absX.value >= safeArea) {
        hasSwiped.value = true;

        absX.value = withTiming(endX, {
          duration: 500,
          easing: Easing.out(Easing.exp),
        });
        btnScale.value = withSpring(0);
        btnTextScale.value = withSpring(0);
        succesOpacity.value = withSequence(
          withTiming(1, { duration: 50 }),
          withTiming(0, { duration: 500 }),
        );
        cancelAnimation(rotation);
        runOnJS(handleThrowRelease)();
      } else {
        absX.value = withTiming(startX, {
          duration: 500,
          easing: Easing.out(Easing.exp),
        });
        btnScale.value = withSpring(100);
        btnTextScale.value = withSpring(150);
        arrowsOpacity.value = withTiming(1, { duration: 200 });
        runOnJS(startRotation)();
      }
    });

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: absX.value - circleSize * 0.5 },
      { translateY: absY.value - circleSize * 0.5 },
    ],
  }));

  const btnImageStyle = useAnimatedStyle(() => ({
    width: `${btnScale.value}%`,
    height: `${btnScale.value}%`,
  }));

  const btnTextStyle = useAnimatedStyle(() => ({
    width: `${btnTextScale.value}%`,
    height: `${btnTextScale.value}%`,
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const succesPanel = useAnimatedStyle(() => ({
    opacity: succesOpacity.value,
  }));

  const arrowsStyle = useAnimatedStyle(() => ({
    opacity: arrowsOpacity.value,
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={drag}>
        <View style={{ width, height, backgroundColor: "#071031" }}>
          {/* Arrows */}
          <Animated.View
            style={[
              arrowsStyle,
              {
                position: "absolute",
                top: height - 350,
                left: width * 0.5 - 50,
                right: 0,
                height: 100,
                justifyContent: "center",
                alignItems: "center",
                pointerEvents: "none",
              },
            ]}
          >
            <View style={{ transform: [{ rotate: "0deg" }] }}>
              <ArrowIndicator count={5} size={20} duration={800} />
            </View>
          </Animated.View>

          {/* Succes panel */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.succes,
              succesPanel,
              { width: width, height: height },
            ]}
          ></Animated.View>

          {/* Conteneur animé qui suit le doigt */}
          <Animated.View
            style={[
              containerStyle,
              {
                width: circleSize,
                height: circleSize,
                position: "absolute",
                top: 0,
                left: 0,
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            {/* Image 1 : Le rond jaune (Maintenant Animated.Image avec style animé) */}
            <Animated.Image
              source={require("@/assets/images/buttons/btn.png")}
              style={[
                btnImageStyle, // Utilisation du style animé
                { position: "absolute" },
              ]}
              resizeMode="contain"
            />

            {/* Image 2 : Le texte (Style animé incluant rotation et scale) */}
            <Animated.Image
              source={require("@/assets/images/buttons/btn-text-intro.png")}
              style={[
                btnTextStyle, // Utilisation du style animé
                { position: "absolute" },
              ]}
              resizeMode="contain"
            />
          </Animated.View>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  debugText: {
    position: "absolute",
    top: 100, // Ajusté pour être visible
    left: 20,
    color: "white",
    fontSize: 16,
    zIndex: 10, // Pour être au-dessus du reste
    pointerEvents: "none", // Pour ne pas bloquer le touch
  },
  succes: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#daf203",
  },
});
