import HorizontalRotation from "@/components/HorizontalRotation";
import { SlingshotDragThree } from "@/components/slingshotDragThree";
import VerticalRotation from "@/components/VerticalRotation";
import { useMotionData } from "@/utils/motionData";
import { useState } from "react";
import { Text, View } from "react-native";

export default function Slingshot() {
  const [data, setData] = useState({ x: 0, y: 0, strength: 0 });

  const motionData = useMotionData();

  if (!motionData) {
    return <Text>Device Motion is not available on desktop</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <SlingshotDragThree onDebugChange={setData} />
      <View style={{position: 'absolute', bottom: 0, left: 0}}>
        <Text style={{ color: '#fff' }}>
          x: {data.x.toFixed(0)}, y: {data.y.toFixed(0)}, strength: {data.strength.toFixed(2)}
        </Text>
        <HorizontalRotation motionData={motionData} />
        <VerticalRotation motionData={motionData} />
      </View>
    </View>
  );
}
