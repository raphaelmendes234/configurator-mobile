import { useCalibration } from "@/contexts/CalibrationContext";
import { getHorizontalAngle, getVerticalAngle } from "@/utils/deviceRotation";
import { SoftHaptic, SuccessHaptic } from "@/utils/haptics";
import { buildPhase2Message } from '@/utils/messageBuilder'; // Assure-toi d'importer ta fonction de message
import { useMotionData } from "@/utils/motionData";
import { sendMessage } from '@/utils/websocket';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, Vibration, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SlingshotCord } from './SlingshotCord';

export function SlingshotScreen() {
  // 1. État pour le debug
  const [debugText, setDebugText] = useState('');

  // Constantes de dimensions
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;
  const circleSize = 100;
  const safeArea = 300;

  // Positions fixes
  const startX = width * 0.5;
  const startY = safeArea * 0.5;
  const endX = width * 0.5;
  const endY = 50;

  // Shared Values
  const absX = useSharedValue(startX);
  const absY = useSharedValue(startY);
  const strength = useSharedValue(0);
  const currentStrengthRef = useRef(0);

  // --- Logique Haptique (JS Side) ---
  const intervalRef = useRef(200);
  const runningRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const isLoopStarted = useRef(false);

  // --- Angle ---
  const motionData = useMotionData();
  const { refAngle } = useCalibration();

  const SMOOTHING_FACTOR = 0.15; // Ajustez cette valeur pour trouver la fluidité désirée (par exemple entre 0.05 et 0.2)
  const ANGLE_THRESHOLD = 10; 
  const lastAnglesRef = useRef({ h: 0, v: 0 });

  const TRANSMISSION_INTERVAL_MS = 16; // Environ 60 FPS. Ajustez si trop gourmand.
  const intervalNetworkRef = useRef<number | null>(null);

  const loop = () => {
    if (!runningRef.current) return;

    if (Platform.OS === "ios") {
      SoftHaptic()
    } else {
      Vibration.vibrate(10);
    }
    timeoutRef.current = setTimeout(loop, intervalRef.current);
  };

  const startHapticLoop = () => {
    if (!runningRef.current) {
      runningRef.current = true;
      isLoopStarted.current = true;
      loop();
    }
  };

  const stopHapticLoop = () => {
    runningRef.current = false;
    isLoopStarted.current = false;
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Fonction appelée via runOnJS pour gérer la fréquence de vibration
  const updateHapticFrequency = (currentStrength: number) => {
    const minStrength = 0;
    const maxStrength = 100;
    const minValue = 10;   // ms entre vibrations (rapide)
    const maxValue = 200; // ms entre vibrations (lent)

    // Interpolation non-linéaire pour un meilleur ressenti
    const t = (currentStrength - minStrength) / (maxStrength - minStrength);
    // Plus la force est grande, plus l'intervalle est petit (vibration rapide)
    // Note: Ta formule originale inversait peut-être logique, ici j'assume : Force ↑ = Intervalle ↓ (Vite)
    // Mais je garde ta logique originale ci-dessous :
    const value = minValue + (maxValue - minValue) * Math.pow(1 - t, 4);

    if (currentStrength > 0) {
      if (!isLoopStarted.current) {
        startHapticLoop();
      }
      intervalRef.current = value;
    } else {
      stopHapticLoop();
    }
  };

  // --- Fonctions JS pour le Debug et Network ---
  const updateDebugJS = (x: number, y: number, str: number) => {
    setDebugText(`X:${x.toFixed(0)} Y:${y.toFixed(0)} Force:${str.toFixed(0)}%`);
  };

  const handleThrowRelease = (finalStrength: number) => {
    SuccessHaptic();

    // Calcul des angles (utilise motionData et refAngle)
    const verticalAngle = getVerticalAngle(motionData); // 0..90°
    const horizontalAngle = getHorizontalAngle(motionData, refAngle); // -90..90°

    // 💡 Envoi du message WebSocket
    const msg = buildPhase2Message("release", Math.round(finalStrength), Math.round(horizontalAngle), Math.round(verticalAngle));
    sendMessage(msg);
    // console.log("Tir effectué avec force :", finalStrength, " horiz:", horizontalAngle, " vert:", verticalAngle);
  };

  const sendRotationData = () => {

    // On utilise la même logique que votre ancien `test()`
    const verticalAngle = getVerticalAngle(motionData); // 0..90°
    const horizontalAngle = getHorizontalAngle(motionData, refAngle); // -90..90°

    const last = lastAnglesRef.current;

    const smoothedH = last.h + (horizontalAngle - last.h) * SMOOTHING_FACTOR;
    const smoothedV = last.v + (verticalAngle - last.v) * SMOOTHING_FACTOR;

    lastAnglesRef.current = { h: smoothedH, v: smoothedV };
    
    const currentStrength = currentStrengthRef.current;
    
    // 💡 Envoi du message WebSocket
    const msg = buildPhase2Message(
      "drag",
      Math.round(currentStrength), 
      Math.round(horizontalAngle), 
      Math.round(verticalAngle));
    sendMessage(msg);

    // Mise à jour optionnelle du debug (côté JS, donc pas besoin de runOnJS)
    // setDebugText(`H: ${Math.round(horizontalAngle)} V: ${Math.round(verticalAngle)}`); 
  };

  // --- Logique d'envoi en continu (useEffect) ---
  useEffect(() => {
    // Démarrage de l'intervalle
    intervalNetworkRef.current = setInterval(sendRotationData, TRANSMISSION_INTERVAL_MS);

    // Nettoyage à la destruction du composant
    return () => {
      if (intervalNetworkRef.current !== null) {
        clearInterval(intervalNetworkRef.current);
      }
    };
  }, [motionData, refAngle]); // Les dépendances garantissent l'accès aux dernières valeurs


  const updateStrengthRef = (newStrength: number) => {
    currentStrengthRef.current = newStrength;
};

  // --- Gesture Handler ---
  const drag = Gesture.Pan()
    .onBegin(event => {
      absX.value = event.absoluteX;
      absY.value = event.absoluteY;
      runOnJS(SoftHaptic)();
      runOnJS(updateStrengthRef)(0);
    })
    .onChange(event => {
      absX.value = event.absoluteX;
      absY.value = event.absoluteY;

      // Calcul de la force (0 à 100)
      // On clamp entre 0 et 1, puis on multiplie par 100
      const rawProgress = (absY.value - safeArea) / (height - safeArea);
      const clampedStrength = Math.min(1, Math.max(0, rawProgress)) * 100;
      strength.value = clampedStrength;

      // runOnJS(test)(strength.value);
      runOnJS(updateStrengthRef)(strength.value);
      

      // 1. Mettre à jour l'interface de debug
      runOnJS(updateDebugJS)(event.absoluteX, event.absoluteY, strength.value);

      // 2. Gérer le moteur haptique (qui vit côté JS avec des refs)
      // runOnJS(updateHapticFrequency)(strength.value);
    })
    .onFinalize((event) => {
      // Arrêt des vibrations
      runOnJS(stopHapticLoop)();

      runOnJS(updateStrengthRef)(0);
      
      // Reset position X
      absX.value = withTiming(endX, {
        duration: 500,
        easing: Easing.out(Easing.exp)
      });

      // Vérification si le tir est valide (tiré en bas de la safeArea)
      if (absY.value >= safeArea) {
        // Animation de retour (tir)
        absY.value = withTiming(startY, {
          duration: 500,
          easing: Easing.out(Easing.exp)
        });

        runOnJS(updateStrengthRef)(0);
        // 💡 Action de tir
        runOnJS(handleThrowRelease)(strength.value);

      } else {
        // Annulation (le doigt n'est pas descendu assez bas)
        absY.value = withTiming(startY, {
          duration: 500,
          easing: Easing.out(Easing.exp)
        });
      }

      strength.value = 0;
    });

  // Utilisation de transform pour meilleure performance
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: absX.value - circleSize * 0.5 },
      { translateY: absY.value - circleSize * 0.5 }
    ]
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={drag}>
        <View style={{width, height, backgroundColor: "#000000"}}>
          <SlingshotCord 
            width={width} 
            height={height} 
            safeArea={safeArea} 
            fingerPosX={absX} 
            fingerPosY={absY} 
            circleSize={circleSize} 
          />
          
          {/* Affichage du Debug */}
          <Text style={styles.debugText}>
            {debugText}
          </Text>

          <Animated.View style={[ styles.circle, containerStyle, { width: circleSize, height: circleSize } ]}/>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  circle: {
    position: "absolute",
    backgroundColor: '#D9F203',
    borderRadius: 100,
    top: 0,
    left: 0,
  },
  debugText: {
    position: "absolute",
    top: 100, // Ajusté pour être visible
    left: 20,
    color: "white",
    fontSize: 16,
    zIndex: 10, // Pour être au-dessus du reste
    pointerEvents: 'none', // Pour ne pas bloquer le touch
  }
});