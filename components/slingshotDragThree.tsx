import { SoftHaptic, SuccessHaptic } from "@/utils/haptics";
import * as Haptics from "expo-haptics";
import { useRef } from 'react';
import { Dimensions, Platform, StyleSheet, Vibration, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SlingshotCord } from './SlingshotCord';



export function SlingshotDragThree({ onDebugChange }: { onDebugChange?: (data: { x: number; y: number; strength: number }) => void }) {

  // Circle size
  const circleSize = 100;

  // Screen dimensions
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;

  // SafeArea
  const safeArea = 300

  // Start position
  const startPos = {
    x: width * 0.5,
    y: safeArea * 0.5,
  }

  // End position
  const endPos = {
    x: width * 0.5,
    y: 50
  }

  // Touch position
  const absX = useSharedValue(startPos.x);
  const absY = useSharedValue(startPos.y);

  // Strength
  let strength = useSharedValue(0)
  let lastStrength = 0

  const intervalRef = useRef(200)
  const runningRef = useRef(false) // état persistant entre rendus
  const timeoutRef = useRef<number | null>(null)
  let isLoopStarted = useRef(false)


  const loop = () => {
    if (!runningRef.current) return;

    // 🔊 Vibrer (toujours Heavy ici)
    if (Platform.OS === "ios") {
      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft) 
    } else {
      Vibration.vibrate(10);
    }

    // ⏳ Planifie la prochaine vibration avec l’intervalle *actuel*
    timeoutRef.current = setTimeout(loop, intervalRef.current);
  };

  const start = () => {
    if (!runningRef.current) {
      runningRef.current = true;
      loop();
      isLoopStarted.current = true
    }
  };

  const stop = () => {
    runningRef.current = false;
    isLoopStarted.current = false
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      isLoopStarted.current = false
    }
  };

  const force = (strength: number) => {
    let minStrength = 0;
    let maxStrength = 100;
    let minValue = 10;
    let maxValue = 200;

    let t = (strength - minStrength) / (maxStrength - minStrength);
    let value = minValue + (maxValue - minValue) * Math.pow(1 - t, 4);
    // let value = minValue + (maxValue - minValue) * (1 - (strength - minStrength) / (maxStrength - minStrength));

    if (strength > 0) {
      if(!isLoopStarted.current){
        start()
      }
      intervalRef.current = value
    } else {
      stop()
    }
  }
  /**
   * Touch drag
   */
  const drag = Gesture.Pan()
    .onBegin(event => {
      absX.value = event.absoluteX;
      absY.value = event.absoluteY;

      runOnJS(SoftHaptic)()
    })
    .onChange(event => {
      absX.value = event.absoluteX;
      absY.value = event.absoluteY;

      strength.value = Math.min(1, Math.max(0, (absY.value - safeArea) / (height - safeArea))) * 100  

      runOnJS(force)(strength.value)

      if (onDebugChange) {
        runOnJS(onDebugChange)({ 
          x: event.absoluteX,
          y: event.absoluteY,
          strength: strength.value 
        });
      }
    })
    .onFinalize((event) => {
      if (onDebugChange) {
        runOnJS(onDebugChange)({ 
          x: event.absoluteX,
          y: event.absoluteY,
          strength: strength.value 
        });
      }
      runOnJS(stop)()

      absX.value = withTiming(endPos.x, {
        duration: 500,
        easing: Easing.out(Easing.exp)
      });

      // if launched
      if(absY.value >= safeArea){

        absY.value = withTiming(startPos.y, {
          duration: 500,
          easing: Easing.out(Easing.exp)
        })

        runOnJS(SuccessHaptic)()

      } else {
        absY.value = withTiming(startPos.y, {
          duration: 500,
          easing: Easing.out(Easing.exp)
        })
      }
    })

  const containerStyle = useAnimatedStyle(() => ({
    top: absY.value - circleSize * 0.5,
    left: absX.value - circleSize * 0.5,
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* <ThreeScene fingerPosX={absX} fingerPosY={absY} colorIndex={colorIndex}></ThreeScene> */}

      <GestureDetector gesture={drag}>
        <View style={{width, height, backgroundColor: "#000000"}}>
          <SlingshotCord width={width} height={height} safeArea={safeArea} fingerPosX={absX} fingerPosY={absY} circleSize={circleSize}></SlingshotCord>
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
    borderRadius: 100
  },
  text: {
    position: "absolute",
    top: 300,
    left: 0
  }
});
