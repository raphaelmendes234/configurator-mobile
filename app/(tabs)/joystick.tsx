import { JoystickDragThree } from "@/components/joystickDragThree";
import { useMotionData } from "@/utils/motionData";
import { useState } from "react";
import { Text, View } from "react-native";

export default function Slingshot() {
  const [data, setData] = useState({ x: 0, y: 0, angle: 0, selectedIndex: 0});

  const motionData = useMotionData();

  if (!motionData) {
    return <Text>Device Motion is not available on desktop</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <JoystickDragThree onDebugChange={setData} />
      <View style={{position: 'absolute', bottom: 0, left: 0}}>
        <Text style={{ color: '#fff' }}>
          x: {data.x.toFixed(0)}, y: {data.y.toFixed(0)}, angle: {data.angle.toFixed(0)}, objet: {data.selectedIndex}
        </Text>
      </View>
    </View>
  );
}
