import { useCalibration } from "@/contexts/CalibrationContext";
import { radToDeg } from "@/utils/math";
import { useMotionData } from "@/utils/motionData";

export function usePerformCalibration() {
  const motionData = useMotionData();
  const { setRefAngle } = useCalibration();

  const calibrate = () => {
    if (motionData && motionData.rotation.alpha != null) {
      const alphaDeg = radToDeg(motionData.rotation.alpha);
      setRefAngle(alphaDeg);
      console.log("Calibration effectuée à :", alphaDeg);
      return true;
    }
    console.warn("Calibration impossible : pas de données de mouvement");
    return false;
  };

  return calibrate;
}
