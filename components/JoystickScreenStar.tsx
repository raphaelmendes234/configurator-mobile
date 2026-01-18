import { SoftHaptic, SuccessHaptic } from "@/utils/haptics"; // Assure-toi que ces chemins sont bons
import { buildPhase1Message } from "@/utils/messageBuilder";
import { sendMessage } from "@/utils/websocket";
import { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
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
import { JoystickWheel } from "./JoystickWheel";

export function JoystickScreenStar() {
  const [debugText, setDebugText] = useState("");

  // Paramètres
  const circleSize = 100;
  const areaRadius = 200;
  const safeArea = 0;
  const numObjects = 3;
  const sectorAngle = 360 / numObjects;

  const width = Dimensions.get("window").width;
  const height = Dimensions.get("window").height;
  const initialX = width * 0.5;
  const initialY = height * 0.5;

  // Shared Values
  const startPosX = useSharedValue(initialX);
  const startPosY = useSharedValue(initialY);
  const absX = useSharedValue(initialX);
  const absY = useSharedValue(initialY);
  const selectedIndex = useSharedValue(0);
  const lastIndex = useSharedValue(0); // Pour éviter le spam vers JS
  const rotation = useSharedValue(0);
  const btnScale = useSharedValue(100);
  const btnTextScale = useSharedValue(150);
  const wheelScale = useSharedValue(0);
  const succesOpacity = useSharedValue(0);
  const arrowsOpacity = useSharedValue(1);

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

  const handleIndexChange = (newIndex: number) => {
    SoftHaptic();
    const msg = buildPhase1Message("hover", newIndex);
    sendMessage(msg);
  };

  const handleRelease = (index: number) => {
    SuccessHaptic();
    const msg = buildPhase1Message("select", index);
    sendMessage(msg);
  };

  const updateDebugJS = (x: number, y: number, angle: number, idx: number) => {
    setDebugText(
      `X:${x.toFixed(0)}, Y:${y.toFixed(0)}, Ang:${angle.toFixed(1)}, Index:${idx}`,
    );
  };

  // Fonctions Worklet (Calculs sur UI Thread)
  const calculateSelection = (
    x: number,
    y: number,
    startX: number,
    startY: number,
  ) => {
    "worklet"; // executable sur ui thread
    const dx = x - startX;
    const dy = y - startY;

    if (isNaN(dx) || isNaN(dy)) return;

    const distance = Math.sqrt(dx * dx + dy * dy);
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (angle < 0) angle += 360;

    const newIndex =
      distance >= safeArea / 2 ? Math.floor(angle / sectorAngle) : -1;

    selectedIndex.value = newIndex;

    // mise à jour du texte de debug
    runOnJS(updateDebugJS)(x, y, angle, newIndex);

    // declenche que si l'index change
    if (newIndex !== lastIndex.value) {
      lastIndex.value = newIndex;
      runOnJS(handleIndexChange)(newIndex);
    }
  };

  const clampToCircle = (
    cx: number,
    cy: number,
    x: number,
    y: number,
    radius: number,
  ) => {
    "worklet";
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= radius) return { x, y };
    const ratio = radius / dist;
    return { x: cx + dx * ratio, y: cy + dy * ratio };
  };

  const drag = Gesture.Pan()
    .onBegin((event) => {
      cancelAnimation(rotation);
      btnScale.value = withTiming(125, { duration: 200 });
      btnTextScale.value = withTiming(50, { duration: 200 });
      wheelScale.value = withTiming(1, { duration: 200 });
      arrowsOpacity.value = withTiming(0, { duration: 300 });

      startPosX.value = event.absoluteX;
      startPosY.value = event.absoluteY;
      absX.value = event.absoluteX;
      absY.value = event.absoluteY;
    })
    .onChange((event) => {
      const clamped = clampToCircle(
        startPosX.value,
        startPosY.value,
        event.absoluteX,
        event.absoluteY,
        areaRadius,
      );

      absX.value = clamped.x;
      absY.value = clamped.y;

      // Calcul direct sur UI Thread
      calculateSelection(
        absX.value,
        absY.value,
        startPosX.value,
        startPosY.value,
      );
    })
    .onFinalize(() => {
      absX.value = withTiming(startPosX.value, {
        duration: 500,
        easing: Easing.out(Easing.exp),
      });
      absY.value = withTiming(startPosY.value, {
        duration: 500,
        easing: Easing.out(Easing.exp),
      });

      btnScale.value = withSpring(100);
      btnTextScale.value = withSpring(150);
      wheelScale.value = withTiming(0, { duration: 200 });
      succesOpacity.value = withSequence(
        withTiming(1, { duration: 50 }),
        withTiming(0, { duration: 500 }),
      );
      arrowsOpacity.value = withTiming(1, { duration: 200 });
      runOnJS(startRotation)();
      runOnJS(handleRelease)(selectedIndex.value);
    });

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: absX.value - circleSize * 0.5 },
      { translateY: absY.value - circleSize * 0.5 },
    ],

    // top: absY.value - circleSize * 0.5,
    // left: absX.value - circleSize * 0.5,
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

  const arrowsGroupStyle = useAnimatedStyle(() => ({
    opacity: arrowsOpacity.value,
    // suit le doigt
    transform: [{ translateX: absX.value }, { translateY: absY.value }],
    // reste au milieu
    // transform: [{ translateX: width * 0.5 }, { translateY: height * 0.5 }],
  }));
  const ARROW_OFFSETS = [
    { id: "right", rotate: "0deg", x: 150, y: 0, count: 3 },
    { id: "left", rotate: "180deg", x: -150, y: 0, count: 3 },
    { id: "down", rotate: "90deg", x: 0, y: 150, count: 4 },
    { id: "up", rotate: "-90deg", x: 0, y: -150, count: 4 },
  ];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={drag}>
        <View style={{ width, height, backgroundColor: "#071031" }}>
          {/* Arrows Group following the finger */}
          <Animated.View
            style={[
              arrowsGroupStyle, // Ce style contient le translateX/Y vers absX et absY
              {
                position: "absolute",
                top: 0,
                left: 0,
                width: circleSize, // On lui donne la même taille que le bouton
                height: circleSize,
                justifyContent: "center",
                alignItems: "center",
                pointerEvents: "none",
                // On compense le fait que absX/Y est le centre,
                // donc on retire la moitié de la taille pour que le conteneur soit centré sur le doigt
                marginTop: -circleSize * 0.5,
                marginLeft: -circleSize * 0.5,
              },
            ]}
          >
            {ARROW_OFFSETS.map((config) => (
              <View
                key={config.id}
                style={{
                  position: "absolute",
                  // Les offsets x et y partent maintenant du centre exact du bouton
                  transform: [
                    { translateX: config.x },
                    { translateY: config.y },
                    { rotate: config.rotate },
                  ],
                }}
              >
                <ArrowIndicator count={config.count} size={20} duration={800} />
              </View>
            ))}
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

          <JoystickWheel
            width={width}
            height={height}
            selectedIndex={selectedIndex}
            fingerPosX={startPosX}
            fingerPosY={startPosY}
            parts={numObjects}
            radius={areaRadius}
            gutter={10}
            color={"#daf203bf"}
            bgColor={"#071031"}
            scale={wheelScale}
          />
          <Text
            style={{ color: "white", position: "absolute", top: 50, left: 20 }}
          >
            {debugText}
          </Text>

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
              source={require("@/assets/images/buttons/btn-text-select.png")}
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
  succes: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#daf203",
  },
});
