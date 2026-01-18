import { useCalibration } from "@/contexts/CalibrationContext";
import { usePerformCalibration } from "@/hooks/usePerformCalibration";
import { getHorizontalAngle } from "@/utils/deviceRotation";
import { radToDeg } from "@/utils/math";
import { useMotionData } from "@/utils/motionData";
import React, { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";

export function WaitingScreen() {
  const motionData = useMotionData();
  const { refAngle, setRefAngle } = useCalibration();
  const calibrate = usePerformCalibration();
  const [currentAlphaDeg, setCurrentAlphaDeg] = useState<number>(0);
  const [currentHorizontalDeg, setCurrentHorizontalDeg] = useState<number>(0);

  useEffect(() => {
    if (!motionData || motionData.rotation.alpha == null) return;

    // angle absolu du téléphone
    const alphaDeg = radToDeg(motionData.rotation.alpha);
    setCurrentAlphaDeg(alphaDeg);

    // angle horizontal relatif à la calibration
    const horiz = getHorizontalAngle(motionData, refAngle);
    setCurrentHorizontalDeg(horiz);
  }, [motionData, refAngle]);

  // const calibrate = () => {
  //   if (!motionData || motionData.rotation.alpha == null) return;
  //   setRefAngle(radToDeg(motionData.rotation.alpha));
  // };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ color: "white", marginBottom: 10 }}>Waiting Screen</Text>

      <Text style={{ color: "white" }}>
        Alpha actuel : {currentAlphaDeg.toFixed(1)}°
      </Text>

      <Text style={{ color: "white", marginTop: 6 }}>
        Angle calibré (refAngle) :{" "}
        {refAngle !== null ? refAngle.toFixed(1) + "°" : "non calibré"}
      </Text>

      <Text style={{ color: "white", marginTop: 6 }}>
        Angle horizontal actuel : {currentHorizontalDeg.toFixed(1)}°
      </Text>

      <View style={{ marginTop: 12 }}>
        <Button title="Calibrer maintenant" onPress={calibrate} />
      </View>
    </View>
  );
}
