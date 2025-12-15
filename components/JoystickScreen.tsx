import { SoftHaptic, SuccessHaptic } from '@/utils/haptics'; // Assure-toi que ces chemins sont bons
import { buildPhase1Message } from '@/utils/messageBuilder';
import { sendMessage } from '@/utils/websocket';
import { useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { JoystickWheel } from './JoystickWheel';

export function JoystickScreen() {
  const [debugText, setDebugText] = useState('');

  // Paramètres
  const circleSize = 100;
  const areaRadius = 200;
  const safeArea = 0;
  const numObjects = 5;
  const sectorAngle = 360 / numObjects;
  
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;
  const initialX = width * 0.5;
  const initialY = height * 0.5;

  // Shared Values
  const startPosX = useSharedValue(initialX);
  const startPosY = useSharedValue(initialY);
  const absX = useSharedValue(initialX);
  const absY = useSharedValue(initialY);
  const selectedIndex = useSharedValue(0);
  const lastIndex = useSharedValue(0); // Pour éviter le spam vers JS


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
      setDebugText(`X:${x.toFixed(0)}, Y:${y.toFixed(0)}, Ang:${angle.toFixed(1)}, Index:${idx}`);
  }

  // Fonctions Worklet (Calculs sur UI Thread)
  const calculateSelection = (x: number, y: number, startX: number, startY: number) => {
    'worklet'; // executable sur ui thread
    const dx = x - startX;
    const dy = y - startY;

    if (isNaN(dx) || isNaN(dy)) return;

    const distance = Math.sqrt(dx * dx + dy * dy);
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    if (angle < 0) angle += 360;

    const newIndex = distance >= safeArea / 2 ? Math.floor(angle / sectorAngle) : -1;
    
    selectedIndex.value = newIndex;

    // mise à jour du texte de debug
    runOnJS(updateDebugJS)(x, y, angle, newIndex);

    // declenche que si l'index change
    if (newIndex !== lastIndex.value) {
      lastIndex.value = newIndex;
      runOnJS(handleIndexChange)(newIndex);
    }
  };

  const clampToCircle = (cx: number, cy: number, x: number, y: number, radius: number) => {
    "worklet";
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= radius) return { x, y };
    const ratio = radius / dist;
    return { x: cx + dx * ratio, y: cy + dy * ratio };
  };

  const drag = Gesture.Pan()
    .onBegin(event => { 
      startPosX.value = event.absoluteX;
      startPosY.value = event.absoluteY;
      absX.value = event.absoluteX;
      absY.value = event.absoluteY;
    })
    .onChange(event => {
      const clamped = clampToCircle(
        startPosX.value,
        startPosY.value,
        event.absoluteX,
        event.absoluteY,
        areaRadius
      );

      absX.value = clamped.x;
      absY.value = clamped.y;

      // Calcul direct sur UI Thread
      calculateSelection(absX.value, absY.value, startPosX.value, startPosY.value);
    })
    .onFinalize(event => {
      absX.value = withTiming(startPosX.value, { duration: 500, easing: Easing.out(Easing.exp) });
      absY.value = withTiming(startPosY.value, { duration: 500, easing: Easing.out(Easing.exp) });

      runOnJS(handleRelease)(selectedIndex.value);
    });

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
        { translateX: absX.value - circleSize * 0.5 }, 
        { translateY: absY.value - circleSize * 0.5 }
    ], 

    // top: absY.value - circleSize * 0.5,
    // left: absX.value - circleSize * 0.5,
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <GestureDetector gesture={drag}>
          <View style={{width, height, backgroundColor: "#000000"}}>
            <JoystickWheel 
              width={width} 
              height={height} 
              selectedIndex={selectedIndex} 
              fingerPosX={startPosX} 
              fingerPosY={startPosY} 
              parts={numObjects} 
              radius={areaRadius} 
              gutter={10} 
              color={"#D9F203"} 
              bgColor={"#000000"}/>
              <Text style={{color: "white", position: 'absolute', top: 50, left: 20}}>
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
    backgroundColor: "#D9F203",
    borderRadius: 100,
    top: 0, 
    left: 0
  },
});