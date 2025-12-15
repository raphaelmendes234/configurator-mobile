import { Dimensions, StyleSheet, View } from 'react-native';

import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { SoftHaptic, SuccessHaptic } from '@/utils/haptics';
import { buildPhase1Message } from '@/utils/messageBuilder';
import { sendMessage } from '@/utils/websocket';
import { JoystickWheel } from './JoystickWheel';

type DebugData = { x: number; y: number; angle: number; selectedIndex: number };

export function JoystickDragThree({ onDebugChange }: { onDebugChange?: (data: DebugData) => void }) {
  // taille du cercle
  const circleSize = 100

  // taille joystick
  const areaRadius = 200
  
  // distance de sélection
  const safeArea = 0

  // dimensions
  const width = Dimensions.get('window').width
  const height = Dimensions.get('window').height
  
  // positions de départ
  const startPosX = useSharedValue(width * 0.5)
  const startPosY = useSharedValue(height * 0.5)

  // position actuelle
  const absX = useSharedValue(startPosX.value)
  const absY = useSharedValue(startPosY.value)

  // nombre d'objets
  const numObjects = 8

  // portion d'un cercle par objet
  const sectorAngle = 360 / numObjects

  // index sélectionné
  let selectedIndex = useSharedValue(0)

  // dernier index sélectionné
  let lastIndex = 0

  // retourne l'index de la portion du cercle en fonction de l'angle 
  const getSelectedObject = (angle: number) => {
    const index = Math.floor(angle / sectorAngle)
    return index 
  };


  const selectObject = (x:number, y:number) => {
    
    const dx = x - startPosX.value
    const dy = y - startPosY.value

    if (isNaN(dx) || isNaN(dy)) return

    const distance = Math.sqrt(dx*dx + dy*dy)

    let angle = Math.atan2(dy, dx) * 180 / Math.PI
    if (angle < 0) angle += 360
    // angle = (360 - angle) % 360

    selectedIndex.value = distance >= safeArea / 2 ? getSelectedObject(angle) : -1

    if (selectedIndex.value != lastIndex) {
      SoftHaptic()
      onSelectChange(selectedIndex.value)
      lastIndex = selectedIndex.value
    }

    // sendMessage(buildPhase1Message(1, selectedIndex.value)) // <- works
      
    onDebugChange?.({
      x,
      y,
      angle,
      selectedIndex: selectedIndex.value
    });
  };

  const clampToCircle = (cx: number, cy: number, x: number, y: number, radius: number) => {
    "worklet";

    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= radius) {
      return { x, y };
    }

    // Normalisation pour ramener le point sur le cercle
    const ratio = radius / dist;

    return {
      x: cx + dx * ratio,
      y: cy + dy * ratio
    };
  }

  const onSelectChange = (index: number) => {
    const msg = buildPhase1Message(1, index)
    sendMessage(msg)
  }

  const onSelectRelease = (index: number) => {
    const msg = buildPhase1Message(2, index);
    sendMessage(msg);
  }

  /**
   * Touch drag
   */
  const drag = Gesture.Pan()
    .onBegin(event => { 
      startPosX.value = event.absoluteX
      startPosY.value = event.absoluteY

      absX.value = event.absoluteX
      absY.value = event.absoluteY
      
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

      runOnJS(selectObject)(absX.value, absY.value);

    })
    .onFinalize(event => {
      absX.value = withTiming(startPosX.value, {
          duration: 500,
          easing: Easing.out(Easing.exp)
      });
      absY.value = withTiming(startPosY.value, {
          duration: 500,
          easing: Easing.out(Easing.exp)
      });
    
      if (onDebugChange) {
        runOnJS(selectObject)(event.absoluteX, event.absoluteY)
      }
      
      runOnJS(onSelectRelease)(selectedIndex.value);

      runOnJS(SuccessHaptic)()

    })

  const containerStyle = useAnimatedStyle(() => ({
    top: absY.value - circleSize * 0.5,
    left: absX.value - circleSize * 0.5,
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
    borderRadius: 100
  },
  text: {
    position: "absolute",
    top: 300,
    left: 0
  },
  zone: {
    position: "absolute"
  }
});
